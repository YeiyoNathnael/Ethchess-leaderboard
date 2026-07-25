<template>
  <div class="rules-container editorial-card">
    <!-- Giant Background Watermark Text -->
    <div class="bg-watermark-text">RULES</div>

    <div class="rules-header">
      <div class="terracotta-tag motto-tag">
        OFFICIAL RULEBOOK &bull; PLAY. ENJOY. REPEAT.
      </div>
      <h2 class="editorial-title">HOW SCORING WORKS</h2>
      <p class="rules-desc">
        Points are awarded per Swiss event (EthChess Tuesday & Freestyle Friday) combining F1 Rank Placement and Participation Bonuses.
      </p>
    </div>

    <div class="grid-section">
      <!-- F1 Rank Points Card -->
      <div class="rule-card">
        <h3 class="card-title">1. F1-STYLE RANK POINTS</h3>
        <p class="card-text">Top finishers per 9-round Swiss tournament receive tier-based placement points:</p>
        
        <div class="points-grid">
          <div class="pt-badge rank-1">
            <span class="rank-name">1ST PLACE</span>
            <span class="rank-score">25 PTS</span>
          </div>
          <div class="pt-badge">
            <span class="rank-name">2ND PLACE</span>
            <span class="rank-score">20 PTS</span>
          </div>
          <div class="pt-badge">
            <span class="rank-name">3RD PLACE</span>
            <span class="rank-score">16 PTS</span>
          </div>
          <div class="pt-badge">
            <span class="rank-name">4TH PLACE</span>
            <span class="rank-score">13 PTS</span>
          </div>
          <div class="pt-badge">
            <span class="rank-name">5TH TO 8TH</span>
            <span class="rank-score">10 PTS</span>
          </div>
        </div>
      </div>

      <!-- Participation Bonus Card -->
      <div class="rule-card">
        <h3 class="card-title">2. PARTICIPATION BONUS</h3>
        <p class="card-text">Every player receives extra bonus points based on completed tournament rounds:</p>

        <div class="bonus-list">
          <div class="bonus-item">
            <span class="bonus-bullet">&bull;</span>
            <div>
              <strong>6 or more rounds played:</strong>
              <span class="bonus-tag">+5 PTS BONUS</span>
            </div>
          </div>
          <div class="bonus-item">
            <span class="bonus-bullet">&bull;</span>
            <div>
              <strong>5 rounds or fewer played:</strong>
              <span class="bonus-tag">+2 PTS BONUS</span>
            </div>
          </div>
        </div>

        <div class="formula-box">
          <span class="formula-lbl">TOTAL EVENT SCORE FORMULA:</span>
          <code class="formula-code">Rank Points + Participation Bonus</code>
        </div>
      </div>
    </div>

    <!-- Eligibility & Anti-Cheating Policies -->
    <div class="policy-section">
      <div class="policy-card reg-policy">
        <h4>RULE 1: REGISTERED PLAYERS ONLY</h4>
        <p>Open only to players registered via the official Google Form. Unregistered participants in Chess.com events are filtered out and do not receive leaderboard allocations.</p>
      </div>

      <div class="policy-card ban-policy">
        <div class="terracotta-tag ban-tag">ZERO TOLERANCE</div>
        <h4>RULE 8: ANTI-CHEATING POLICY</h4>
        <p>Suspicious accounts, sandbagging, and cheating will not be tolerated. Verified violations result in an immediate lifetime ban from all league leaderboards.</p>
      </div>
    </div>

    <!-- Official Tagline Banner -->
    <div class="tagline-banner">
      <span class="tagline-text">PLAY. ENJOY. REPEAT.</span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.rules-container {
  padding: 40px;
  border: 1px solid var(--color-border);
  margin-bottom: 48px;
  background: #FFFFFF;
  border-radius: var(--radius-sharp);
  position: relative;
}

.rules-header {
  text-align: center;
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.motto-tag {
  margin-bottom: 14px;
}

.editorial-title {
  font-size: 2rem;
  margin-bottom: 8px;
}

.rules-desc {
  font-size: 0.9rem;
  color: var(--color-dark-muted);
  max-width: 650px;
  margin: 0 auto;
}

.grid-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.rule-card {
  background: #FAFAFA;
  border: 1px solid var(--color-border);
  padding: 24px;
  border-radius: var(--radius-sharp);
}

.card-title {
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--color-dark);
}

.card-text {
  font-size: 0.85rem;
  color: var(--color-dark-muted);
  margin-bottom: 20px;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.pt-badge {
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-title);
  border: 1px solid var(--color-border);
  background: #FFFFFF;
  border-radius: var(--radius-sharp);
}

.pt-badge.rank-1 {
  border-color: var(--color-jade);
  background: rgba(0, 168, 107, 0.04);
}

.pt-badge.rank-1 .rank-score {
  color: var(--color-jade);
}

.rank-name {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

.rank-score {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
}

.bonus-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
}

.bonus-bullet {
  color: var(--color-jade);
  font-size: 1.2rem;
}

.bonus-tag {
  display: inline-block;
  margin-left: 6px;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.72rem;
  color: var(--color-jade);
}

.formula-box {
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--radius-sharp);
}

.formula-lbl {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

.formula-code {
  font-family: monospace;
  font-weight: 700;
  color: var(--color-jade);
}

.policy-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.policy-card {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  position: relative;
}

.reg-policy {
  border-left: 3px solid var(--color-jade);
  background: #FFFFFF;
}

.ban-policy {
  border-left: 3px solid var(--color-terracotta);
  background: #FFFFFF;
}

.ban-tag {
  font-size: 0.6rem;
  margin-bottom: 8px;
}

.policy-card h4 {
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.policy-card p {
  font-size: 0.82rem;
  color: var(--color-dark-muted);
}

.tagline-banner {
  text-align: center;
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
  position: relative;
  z-index: 1;
}

.tagline-text {
  font-family: var(--font-title);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-jade);
}

@media (max-width: 768px) {
  .grid-section, .policy-section {
    grid-template-columns: 1fr;
  }
}
</style>
