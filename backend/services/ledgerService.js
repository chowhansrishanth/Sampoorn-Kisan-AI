'use strict';
/**
 * Farm Financial Ledger & Bank/KCC Loan Statement Service
 * Manages farmer income/expense records, cost breakdowns, and bank-ready
 * Kisan Credit Card (KCC) financial statements adhering to NABARD norms.
 */

const fs = require('fs');
const path = require('path');

const LEDGER_FILE = path.join(process.env.DATA_DIR || path.join(__dirname, '../data'), 'farm_ledger.json');

let ledgerStore = {};
let isLoaded = false;

function loadLedger() {
  if (isLoaded) return;
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      ledgerStore = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
    }
  } catch {
    ledgerStore = {};
  }
  isLoaded = true;
}

function saveLedger() {
  try {
    const dir = path.dirname(LEDGER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const temporary = LEDGER_FILE + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(ledgerStore, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporary, LEDGER_FILE);
  } catch (err) {
    throw Object.assign(new Error('Could not persist transaction. Please retry.'), { status: 503, cause: err });
  }
}

function getTransactions(farmerId = 'guest') {
  loadLedger();
  if (!ledgerStore[farmerId] || ledgerStore[farmerId].length === 0) {
    ledgerStore[farmerId] = [];
    saveLedger();
  }
  return [...ledgerStore[farmerId]].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function addTransaction(farmerId, { type, category, amount, date, notes }) {
  loadLedger();
  if (!ledgerStore[farmerId]) {
    ledgerStore[farmerId] = [];
  }

  const newTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: date || new Date().toISOString().split('T')[0],
    type: type === 'income' ? 'income' : 'expense',
    category: category || 'Other',
    amount: Math.abs(Number(amount)) || 0,
    notes: notes || '',
  };

  ledgerStore[farmerId].unshift(newTx);
  saveLedger();
  return newTx;
}

function deleteTransaction(farmerId, txId) {
  loadLedger();
  if (!ledgerStore[farmerId]) return false;
  const initialLen = ledgerStore[farmerId].length;
  ledgerStore[farmerId] = ledgerStore[farmerId].filter((tx) => tx.id !== txId);
  saveLedger();
  return ledgerStore[farmerId].length < initialLen;
}

/**
 * Generate Bank / Kisan Credit Card (KCC) Financial Balance Statement
 */
function generateKccStatement(farmerId, farmDetails = {}) {
  const txs = getTransactions(farmerId);
  const { farmSizeAcres = 2.5, cropType = 'Cotton & Pulses', farmerName = 'Farmer' } = farmDetails;

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory = {};
  const incomeByCategory = {};

  txs.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
    } else {
      totalExpense += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  });

  const netOperatingIncome = totalIncome - totalExpense;
  const operatingExpenseRatio = totalIncome > 0 ? Number(((totalExpense / totalIncome) * 100).toFixed(1)) : 0;
  const costPerAcre = Number((totalExpense / Math.max(farmSizeAcres, 0.5)).toFixed(0));

  // NABARD Scale of Finance benchmark (~₹45,000 to ₹60,000 / acre for cotton/vegetables)
  const scaleOfFinancePerAcre = 50000;
  const recommendedCreditLimit = Math.round(farmSizeAcres * scaleOfFinancePerAcre * 1.1); // Includes 10% consumption buffer

  return {
    statementDate: new Date().toISOString().split('T')[0],
    farmerId,
    farmerName,
    farmSizeAcres,
    cropType,
    financialSummary: {
      totalIncome,
      totalExpense,
      netOperatingIncome,
      costPerAcre,
      operatingExpenseRatioPercent: operatingExpenseRatio,
    },
    expenseBreakdown: expenseByCategory,
    incomeBreakdown: incomeByCategory,
    kccEligibility: {
      scaleOfFinancePerAcre,
      recommendedCreditLimit,
      subsidizedInterestRatePercent: 4.0, // 7% base - 3% prompt repayment incentive
      estimatedAnnualInterestSavings: Math.round(recommendedCreditLimit * 0.08),
      bankRecommendationScore: netOperatingIncome > 0 ? 'AAA (Prime Credit Candidate)' : 'AA (Eligible with Collateral Security)',
    },
    transactionHistory: txs,
  };
}

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
  generateKccStatement,
};
