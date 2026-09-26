import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";
import axios from "../api/client";
import { FileText, PlusCircle, TrendingUp, TrendingDown, DollarSign, Printer, Trash2, Building, CreditCard } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatCard, StatusBadge } from "../components/ui/StatCard";

const EXPENSE_CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticides",
  "Labor",
  "Diesel / Fuel",
  "Irrigation / Electricity",
  "Machinery Rental",
  "Other",
];

const INCOME_CATEGORIES = [
  "Harvest Sale",
  "Subsidies / DBT",
  "Crop Insurance Payout",
  "Other",
];

export default function FarmLedger({ user }) {
  const farmerId = user?.id || user?._id || "guest";

  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Seeds");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { data, loading, error, reload } = useApiResource([
    { url: '/api/ledger/' + farmerId },
    { url: '/api/ledger/' + farmerId + '/kcc-statement', params: { farmSizeAcres: user?.farmSizeHectares ? (user.farmSizeHectares * 2.47).toFixed(1) : 2.5, farmerName: user?.name || 'Farmer' } }
  ]);
  const transactions = data?.[0]?.transactions || [];
  const kccStatement = data?.[1]?.statement;
  const fetchData = reload;

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      const res = await axios.post(`/api/ledger/${farmerId}`, {
        type,
        category,
        amount: Number(amount),
        date,
        notes,
      });
      if (res.data?.success) {
        setAmount("");
        setNotes("");
        setShowAddForm(false);
        fetchData();
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const handleDelete = async (txId) => {
    try {
      await axios.delete(`/api/ledger/${farmerId}/${txId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = kccStatement?.financialSummary;
  const kcc = kccStatement?.kccEligibility;

  return (
    <div className="page-container farm-ledger-page">
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <div className="no-print">
        <PageHeader
          title="Farm Financial Ledger & KCC Loan Statement"
          subtitle="Record Field Expenses, Harvest Incomes & Export NABARD-Compliant Bank Statements"
          badge="Agri-Finance & Credit Assurance • NABARD Scale of Finance"
          icon={FileText}
          action={
            <div style={{ display: "flex", gap: "10px" }}>
              <PremiumButton
                variant="secondary"
                size="md"
                icon={Printer}
                onClick={handlePrint}
              >
                Print KCC Statement 📄
              </PremiumButton>
              <PremiumButton
                variant="primary"
                size="md"
                icon={PlusCircle}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? "Cancel" : "Add Record +"}
              </PremiumButton>
            </div>
          }
        />

        {/* ADD TRANSACTION FORM */}
        {showAddForm && (
          <PremiumCard style={{ marginBottom: "24px", background: "var(--fk-bg, #f8fafc)", border: "1px solid var(--fk-border, #e2e8f0)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text, #0f172a)", marginBottom: "14px", fontFamily: "Outfit, sans-serif" }}>
              New Farm Financial Entry
            </h3>
            <form onSubmit={handleAddTransaction} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                  Entry Type
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory(e.target.value === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
                  }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
                >
                  <option value="expense">Expense (Outflow 🔴)</option>
                  <option value="income">Income (Inflow 🟢)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
                >
                  {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                  Notes / Receipt Detail
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 bags DAP fertilizer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "600", fontSize: "13px" }}
                />
              </div>

              <PremiumButton type="submit" variant="primary" size="md">
                Save Entry
              </PremiumButton>
            </form>
          </PremiumCard>
        )}

        {/* FINANCIAL SUMMARY CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <StatCard
            icon={TrendingUp}
            title="Total Farm Income"
            value={summary?.totalIncome ? `₹${summary.totalIncome.toLocaleString()}` : "₹0"}
            unit=""
            subtitle="Crop Sales & DBT Subsidies"
            color="#15803d"
          />
          <StatCard
            icon={TrendingDown}
            title="Total Field Expenses"
            value={summary?.totalExpense ? `₹${summary.totalExpense.toLocaleString()}` : "₹0"}
            unit=""
            subtitle={`Cost per Acre: ₹${summary?.costPerAcre?.toLocaleString() || 0}`}
            color="#dc2626"
          />
          <StatCard
            icon={DollarSign}
            title="Net Operating Income"
            value={summary?.netOperatingIncome ? `₹${summary.netOperatingIncome.toLocaleString()}` : "₹0"}
            unit=""
            subtitle={summary?.netOperatingIncome >= 0 ? "Profitable Season 🌾" : "Operating Deficit ⚠️"}
            color={summary?.netOperatingIncome >= 0 ? "#15803d" : "#d97706"}
          />
          <StatCard
            icon={CreditCard}
            title="Recommended KCC Limit"
            value={kcc?.recommendedCreditLimit ? `₹${(kcc.recommendedCreditLimit / 1000).toFixed(0)}k` : "₹0"}
            unit=""
            subtitle="At 4.0% Subsidized Interest"
            color="#2563eb"
          />
        </div>
      </div>

      {/* KCC PRINTABLE STATEMENT SECTION */}
      <PremiumCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid var(--fk-border, #e2e8f0)", paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Building size={22} style={{ color: "#2563eb" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                Kisan Credit Card (KCC) Bank Financial Statement
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)", margin: "4px 0 0" }}>
              Official verification sheet for SBI, PNB, Canara Bank, and Regional Rural Bank agricultural crop loan applications.
            </p>
          </div>
          <StatusBadge status="success">NABARD Scale of Finance Certified</StatusBadge>
        </div>

        {/* Bank Eligibility Overview Box */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", padding: "14px", background: "var(--fk-bg, #f8fafc)", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>FARMER NAME</div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>{kccStatement?.farmerName || "Farmer"}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>OPERATING HOLDING</div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>{kccStatement?.farmSizeAcres || 2.5} Acres ({kccStatement?.cropType})</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>SCALE OF FINANCE</div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>₹{kcc?.scaleOfFinancePerAcre?.toLocaleString()}/Acre</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>CREDIT RATING</div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#15803d" }}>{kcc?.bankRecommendationScore}</div>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--fk-border, #e2e8f0)", color: "var(--fk-text-sub, #64748b)" }}>
                <th style={{ padding: "10px 8px" }}>Date</th>
                <th style={{ padding: "10px 8px" }}>Type</th>
                <th style={{ padding: "10px 8px" }}>Category</th>
                <th style={{ padding: "10px 8px" }}>Particulars / Notes</th>
                <th style={{ padding: "10px 8px", textAlign: "right" }}>Amount (₹)</th>
                <th className="no-print" style={{ padding: "10px 8px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isInc = tx.type === "income";
                return (
                  <tr key={tx.id} style={{ borderBottom: "1px solid var(--fk-border, #e2e8f0)" }}>
                    <td style={{ padding: "10px 8px", color: "var(--fk-text-sub, #64748b)" }}>{tx.date}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: isInc ? "#dcfce7" : "rgba(239,68,68,0.1)", color: isInc ? "#15803d" : "#dc2626" }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: "700", color: "var(--fk-text, #0f172a)" }}>{tx.category}</td>
                    <td style={{ padding: "10px 8px", color: "var(--fk-text-sub, #475569)" }}>{tx.notes}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "800", color: isInc ? "#15803d" : "#dc2626" }}>
                      {isInc ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="no-print" style={{ padding: "10px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        title="Delete entry"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}
