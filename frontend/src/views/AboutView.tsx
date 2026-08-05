export default function AboutView() {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">About AgriShield</span>
        </div>
        <p className="text-sm" style={{ lineHeight: 1.6 }}>
          AgriShield is a parametric micro-insurance pool built on Stellar/Soroban.
          It protects smallholder farmers in Nigeria against drought using
          weather-indexed triggers from dual oracles.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">How It Works</span>
        </div>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
          <p><strong>1. Deposit Liquidity:</strong> Investors provide mUSD to the pool.</p>
          <p><strong>2. Farmers Enroll:</strong> Pay a small premium for weather coverage.</p>
          <p><strong>3. Oracle Reports:</strong> Two independent oracles submit rainfall data.</p>
          <p><strong>4. Auto Trigger:</strong> If rainfall ≤ 50mm, the pool triggers automatically.</p>
          <p><strong>5. Claim Payout:</strong> Enrolled farmers claim their coverage amount.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Deployed Contracts</span>
        </div>
        <div className="input-group">
          <label>Insurance Pool</label>
          <input className="input" readOnly value="CBIWIRJXYPJYMGHS52GU3C6NJTVMNKNRFFKTGBYWQ4R3RQSNGGG6O45G" style={{ fontSize: '0.7rem' }} />
        </div>
        <div className="input-group">
          <label>MicroUSD Token</label>
          <input className="input" readOnly value="CCXCW2SCJB4E6FOKAP6MTASQE4CL2QOYHWUILTYIE6JQRMY7KALKURWU" style={{ fontSize: '0.7rem' }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Links</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="https://github.com/KarenZita01/Parametric-Micro-Insurance-Pool" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            GitHub Repository
          </a>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Stellar Network
          </a>
          <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Soroban Docs
          </a>
        </div>
      </div>
    </div>
  )
}
