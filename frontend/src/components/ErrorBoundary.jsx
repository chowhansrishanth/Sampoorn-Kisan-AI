import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Sampoorn Kisan UI error:", error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <AlertTriangle size={28} />
          <h2>This section could not be loaded</h2>
          <p>Please retry. Your farm data and other pages are unaffected.</p>
          <button type="button" className="lg-btn-primary" onClick={this.handleRetry} style={{ maxWidth: 220 }}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
