<template>
  <div class="leaderboard-wrapper editorial-card">
    <!-- Giant Background Watermark Text (from promo poster style) -->
    <div class="bg-watermark-text">ETHCHESS</div>

    <!-- Header with Typographic Hierarchy -->
    <div class="table-header-block">
      <div class="header-main">
        <h2 class="editorial-title">{{ title }}</h2>
        <p class="editorial-subtitle">{{ subtitle }}</p>
      </div>

      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="SEARCH PLAYER OR HANDLE..."
          class="editorial-search-input"
        />
      </div>
    </div>

    <!-- Editorial Podium Cards with Tilted Terracotta Tag & Bold Numerals -->
    <div v-if="topThree.length > 0 && !searchQuery" class="podium-editorial-grid">
      <!-- 2nd Place -->
      <div v-if="topThree[1]" class="podium-card rank-second" @click="$emit('select-player', topThree[1])">
        <div class="podium-top">
          <span class="podium-num">02</span>
          <span class="podium-label">RANK 02</span>
        </div>
        <div class="podium-meta">
          <span class="podium-name">{{ topThree[1].name }}</span>
          <span class="podium-handle">@{{ topThree[1].username }}</span>
        </div>
        <div class="podium-score">
          <span class="pts-number">{{ topThree[1].totalPoints }}</span>
          <span class="pts-label">PTS</span>
        </div>
      </div>

      <!-- 1st Place (Season Leader - Pinned with Tilted Terracotta Tag) -->
      <div v-if="topThree[0]" class="podium-card rank-first" @click="$emit('select-player', topThree[0])">
        <!-- Rotated Terracotta Sticker Tag from Poster Brand Language -->
        <div class="terracotta-tag tag-pinned">
          SEASON LEADER
        </div>

        <div class="podium-top">
          <span class="podium-num hero-num">01</span>
          <span class="podium-label hero-label">RANK 01</span>
        </div>
        <div class="podium-meta">
          <span class="podium-name hero-name">{{ topThree[0].name }}</span>
          <span class="podium-handle">@{{ topThree[0].username }}</span>
        </div>
        <div class="podium-score hero-score">
          <span class="pts-number hero-pts">{{ topThree[0].totalPoints }}</span>
          <span class="pts-label hero-pts-lbl">PTS</span>
        </div>
      </div>

      <!-- 3rd Place -->
      <div v-if="topThree[2]" class="podium-card rank-third" @click="$emit('select-player', topThree[2])">
        <div class="podium-top">
          <span class="podium-num terracotta-num">03</span>
          <span class="podium-label terracotta-lbl">RANK 03</span>
        </div>
        <div class="podium-meta">
          <span class="podium-name">{{ topThree[2].name }}</span>
          <span class="podium-handle">@{{ topThree[2].username }}</span>
        </div>
        <div class="podium-score">
          <span class="pts-number">{{ topThree[2].totalPoints }}</span>
          <span class="pts-label">PTS</span>
        </div>
      </div>
    </div>

    <!-- Editorial Data Table (Quiet Hairline Dividers + Terracotta Accents) -->
    <div class="table-responsive">
      <table class="editorial-table">
        <thead>
          <tr>
            <th class="th-rank">RANK</th>
            <th class="th-player">PLAYER</th>
            <th class="th-handle">CHESS.COM HANDLE</th>
            <th class="th-stat">EVENTS</th>
            <th class="th-stat">PODIUMS</th>
            <th class="th-stat">F1 PTS</th>
            <th class="th-stat">PART. BONUS</th>
            <th class="th-total">TOTAL POINTS</th>
            <th class="th-action">DETAILS</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="row in filteredRows" 
            :key="row.username"
            :class="['table-row', { 'first-place-row': row.rank === 1 }]"
            @click="$emit('select-player', row)"
          >
            <td class="td-rank">
              <span :class="['rank-num', { 'rank-num-first': row.rank === 1, 'rank-num-third': row.rank === 3 }]">
                {{ formatRankNum(row.rank) }}
              </span>
            </td>

            <td class="td-player">
              <span class="player-fullname">{{ row.name }}</span>
            </td>

            <td class="td-handle">
              <a 
                :href="`https://www.chess.com/member/${row.username}`" 
                target="_blank"
                class="chesscom-link"
                @click.stop
              >
                @{{ row.username }}
              </a>
            </td>

            <td class="td-stat">{{ row.eventsPlayed }}</td>

            <td class="td-stat">
              <div class="podium-summary">
                <span v-if="row.firstCount > 0" class="podium-subtle jade-highlight">1st: {{ row.firstCount }}</span>
                <span v-if="row.secondCount > 0" class="podium-subtle">2nd: {{ row.secondCount }}</span>
                <span v-if="row.thirdCount > 0" class="podium-subtle terracotta-highlight">3rd: {{ row.thirdCount }}</span>
                <span v-if="!row.firstCount && !row.secondCount && !row.thirdCount" class="text-muted">-</span>
              </div>
            </td>

            <td class="td-stat">{{ row.rankPoints }}</td>
            <td class="td-stat">
              <span class="bonus-stat-tag">+{{ row.participationPoints }}</span>
            </td>

            <td class="td-total">
              <span :class="['total-pts-text', { 'hero-total-pts': row.rank === 1 }]">
                {{ row.totalPoints }} PTS
              </span>
            </td>

            <td class="td-action">
              <button class="editorial-btn" @click.stop="$emit('select-player', row)">
                HISTORY &rarr;
              </button>
            </td>
          </tr>

          <tr v-if="filteredRows.length === 0">
            <td colspan="9" class="empty-state">
              NO STANDINGS FOUND. SYNC A TOURNAMENT OR ADJUST SEARCH QUERY.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: { type: String, default: 'OVERALL SEASON LEADERBOARD' },
  subtitle: { type: String, default: 'Official EthChess F1 Placement and Participation Standings' },
  rows: { type: Array, default: () => [] }
});

defineEmits(['select-player']);

const searchQuery = ref('');

const filteredRows = computed(() => {
  if (!searchQuery.value.trim()) return props.rows;
  const q = searchQuery.value.toLowerCase();
  return props.rows.filter(r => 
    r.name.toLowerCase().includes(q) || 
    r.username.toLowerCase().includes(q)
  );
});

const topThree = computed(() => {
  return props.rows.slice(0, 3);
});

const formatRankNum = (rank) => {
  return rank < 10 ? `0${rank}` : `${rank}`;
};
</script>

<style scoped>
.leaderboard-wrapper {
  padding: 40px;
  border: 1px solid var(--color-border);
  margin-bottom: 48px;
  background: #FFFFFF;
  border-radius: var(--radius-sharp);
  position: relative;
}

.table-header-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 36px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.editorial-title {
  font-size: 1.8rem;
  letter-spacing: 0.01em;
  color: var(--color-dark);
  line-height: 1.15;
}

.editorial-subtitle {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-dark-muted);
  margin-top: 6px;
}

.editorial-search-input {
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 8px 14px;
  border: 1px solid #D1D5DB;
  border-radius: var(--radius-sharp);
  background: #FAFAFA;
  width: 240px;
  outline: none;
}

.editorial-search-input:focus {
  border-color: var(--color-jade);
  background: #FFFFFF;
}

/* Editorial Podium Grid */
.podium-editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
  align-items: stretch;
  position: relative;
  z-index: 1;
}

.podium-card {
  background: #FAFAFA;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
  position: relative;
}

.podium-card:hover {
  border-color: var(--color-dark);
  transform: translateY(-2px);
}

/* #1 Season Leader Card with Terracotta Tag */
.podium-card.rank-first {
  background: #FAFDFB;
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-jade);
}

.tag-pinned {
  position: absolute;
  top: -12px;
  right: 14px;
  font-size: 0.68rem;
}

.podium-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.podium-num {
  font-family: var(--font-title);
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  color: #9CA3AF;
}

.hero-num {
  color: var(--color-jade);
  font-size: 2.8rem;
}

.terracotta-num {
  color: var(--color-terracotta);
}

.podium-label {
  font-family: var(--font-title);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-dark-muted);
}

.hero-label {
  color: var(--color-jade);
}

.terracotta-lbl {
  color: var(--color-terracotta);
}

.podium-meta {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.podium-name {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--color-dark);
}

.hero-name {
  font-weight: 700;
  font-size: 1.15rem;
}

.podium-handle {
  font-size: 0.8rem;
  color: var(--color-dark-muted);
}

.podium-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.pts-number {
  font-family: var(--font-title);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dark);
}

.hero-pts {
  color: var(--color-jade);
  font-size: 1.7rem;
}

.hero-pts-lbl {
  color: var(--color-jade);
}

.pts-label {
  font-family: var(--font-title);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

/* Editorial Table */
.table-responsive {
  overflow-x: auto;
  position: relative;
  z-index: 1;
}

.editorial-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.editorial-table th {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #6B7280;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
}

.table-row {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.table-row:hover {
  background-color: rgba(0, 168, 107, 0.03);
}

.table-row.first-place-row {
  background-color: rgba(0, 168, 107, 0.04);
}

.table-row td {
  padding: 12px 14px;
  font-size: 0.88rem;
}

.rank-num {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.95rem;
  color: #6B7280;
}

.rank-num-first {
  color: var(--color-jade);
  font-size: 1.1rem;
}

.rank-num-third {
  color: var(--color-terracotta);
}

.player-fullname {
  font-weight: 600;
  color: var(--color-dark);
}

.chesscom-link {
  color: var(--color-dark);
  text-decoration: none;
  font-weight: 500;
}

.chesscom-link:hover {
  color: var(--color-jade);
  text-decoration: underline;
}

.podium-summary {
  display: flex;
  gap: 8px;
}

.podium-subtle {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9CA3AF;
}

.jade-highlight {
  color: var(--color-jade);
  font-weight: 700;
}

.terracotta-highlight {
  color: var(--color-terracotta);
  font-weight: 700;
}

.bonus-stat-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-jade);
}

.total-pts-text {
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-dark);
}

.hero-total-pts {
  color: var(--color-jade);
}

.editorial-btn {
  background: transparent;
  border: 1px solid #D1D5DB;
  color: #4B5563;
  font-family: var(--font-title);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: var(--radius-sharp);
  transition: all 0.15s ease;
}

.editorial-btn:hover {
  background: var(--color-dark);
  color: #FFFFFF;
  border-color: var(--color-dark);
}

.empty-state {
  text-align: center;
  padding: 36px;
  font-family: var(--font-title);
  font-size: 0.8rem;
  color: var(--color-dark-muted);
}

@media (max-width: 768px) {
  .podium-editorial-grid {
    grid-template-columns: 1fr;
  }
}
</style>
