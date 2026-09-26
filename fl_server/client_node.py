import time

class LocalFarmNodeClient:
    """
    Simulated Federated Learning Client Node running on edge/farm gateway.
    Trains local model on private IoT sensor data and encrypts local gradient updates.
    """
    def __init__(self, node_id="Farm_Node_01", farm_name="Punjab Farm Network"):
        self.node_id = node_id
        self.farm_name = farm_name

    def train_local_epoch(self, global_weights=None):
        print(f"[{self.node_id}] Fetching latest global weights...")
        time.sleep(0.1)
        print(f"[{self.node_id}] Training local model on IoT sensor dataset (1,250 samples)...")
        time.sleep(0.1)
        print(f"[{self.node_id}] Applying Differential Privacy noise (epsilon=1.2)...")
        print(f"[{self.node_id}] Encrypting local gradient payload with AES-256-GCM...")

        return {
            "node_id": self.node_id,
            "status": "Gradients Transmitted",
            "loss": 0.042,
            "accuracy": 0.945,
            "privacy_budget_consumed": 0.05
        }

if __name__ == "__main__":
    client = LocalFarmNodeClient()
    print(client.train_local_epoch())
