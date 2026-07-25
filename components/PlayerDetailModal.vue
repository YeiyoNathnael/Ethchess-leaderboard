<template>
  <div v-if="player" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content editorial-card">
      <!-- Low-Opacity Background Watermark Typography -->
      <div class="bg-watermark-text modal-watermark">HISTORY</div>

      <div class="modal-header">
        <div class="header-left">
          <div class="header-brand-row">
            <EthChessLogo :size="28" />
            <div class="terracotta-tag tag-mini">
              PERFORMANCE RECORD
            </div>
          </div>
          <h3 class="player-name editorial-title">{{ player.name }}</h3>
          <a :href="`https://www.chess.com/member/${player.username}`" target="_blank" class="player-handle">
            @{{ player.username }} &rarr;
          </a>
        </div>

        <button class="close-btn" @click="$emit('close')">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Overview Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-lbl">SEASON RANK</span>
          <span class="stat-val rank-val">#{{ formatRankNum(player.rank) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-lbl">TOTAL POINTS</span>
          <span class="stat-val jade-val">{{ player.totalPoints }} PTS</span>
        </div>
        <div class="stat-card">
          <span class="stat-lbl">EVENTS PLAYED</span>
          <span class="stat-val">{{ player.eventsPlayed }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-lbl">PODIUM SUMMARY</span>
          <span class="stat-val podium-val">
            1st: {{ player.firstCount }} | 2nd: {{ player.secondCount }} | 3rd: {{ player.thirdCount }}
          </span>
        </div>
      </div>

      <!-- Tournament Performance History Table -->
      <h4 class="history-title">EVENT PERFORMANCE BREAKDOWN</h4>
      <div class="history-table-box">
        <table class="history-table">
          <thead>
            <tr>
              <th>TOURNAMENT</th>
              <th>CATEGORY</th>
              <th>RANK</th>
              <th>SWISS SCORE</th>
              <th>ROUNDS</th>
              <th>TOTAL PTS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, idx) in player.history" :key="idx">
              <td class="tourney-name">{{ h.tournamentName }}</td>
              <td>
                <span :class="['cat-badge', h.eventType]">
                  {{ h.eventType === 'tuesday' ? 'Tuesday League' : 'Freestyle Friday' }}
                </span>
              </td>
              <td class="rank-cell">#{{ formatRankNum(h.rank) }}</td>
              <td>{{ h.swissPoints }}</td>
              <td>{{ h.roundsPlayed }}/9</td>
              <td class="pts-cell">{{ h.totalPoints }} PTS</td>
            </tr>
            <tr v-if="!player.history || player.history.length === 0">
              <td colspan="6" class="no-hist">NO TOURNAMENT RECORDS FOUND FOR THIS SEASON.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next';
import EthChessLogo from '~/components/EthChessLogo.vue';

defineProps({
  player: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

const formatRankNum = (rank) => {
  if (typeof rank === 'number') {
    return rank < 10 ? `0${rank}` : `${rank}`;
  }
  return rank;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 24, 21, 0.5);
  backdrop-filter: blur(2px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 36px;
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  position: relative;
}

.modal-watermark {
  top: 20px;
  right: 20px;
  font-size: 8rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.header-brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-mini {
  font-size: 0.62rem;
  padding: 3px 10px;
}

.player-name {
  font-size: 1.8rem;
  line-height: 1.1;
  color: var(--color-dark);
}

.player-handle {
  color: var(--color-jade);
  text-decoration: none;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.85rem;
}

.player-handle:hover {
  text-decoration: underline;
}

.close-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  padding: 6px;
  cursor: pointer;
  color: var(--color-dark-muted);
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--color-dark);
  color: #FFFFFF;
  border-color: var(--color-dark);
}

.close-icon {
  width: 18px;
  height: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: #FAFAFA;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-lbl {
  font-family: var(--font-title);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-dark-muted);
  margin-bottom: 4px;
}

.stat-val {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-dark);
}

.rank-val { color: var(--color-dark); }
.jade-val { color: var(--color-jade); }
.podium-val { font-size: 0.85rem; }

.history-title {
  font-family: var(--font-title);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: var(--color-dark);
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}

.history-table-box {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.history-table th {
  background: #FAFAFA;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-title);
  font-size: 0.7rem;
  color: #6B7280;
}

.history-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
}

.tourney-name {
  font-weight: 600;
}

.cat-badge {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-sharp);
}

.cat-badge.tuesday {
  background: rgba(0, 168, 107, 0.08);
  color: var(--color-jade);
}

.cat-badge.friday {
  background: rgba(226, 114, 91, 0.1);
  color: var(--color-terracotta);
}

.rank-cell {
  font-family: var(--font-title);
  font-weight: 700;
}

.pts-cell {
  font-family: var(--font-title);
  font-weight: 700;
  color: var(--color-jade);
}

.no-hist {
  text-align: center;
  padding: 24px;
  font-family: var(--font-title);
  font-size: 0.8rem;
  color: var(--color-dark-muted);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
