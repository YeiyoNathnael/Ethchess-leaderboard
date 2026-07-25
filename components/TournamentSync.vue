<template>
  <div class="sync-card editorial-card">
    <div class="sync-header">
      <div>
        <h3 class="sync-title">CHESS.COM TOURNAMENT LINK SYNC ENGINE</h3>
        <p class="sync-sub">Input a Chess.com tournament URL to automatically fetch standings and compute EthChess F1 points</p>
      </div>
    </div>

    <form @submit.prevent="syncTournament" class="sync-form">
      <div class="form-grid">
        <div class="form-group url-group">
          <label class="form-label">CHESS.COM TOURNAMENT LINK OR SLUG</label>
          <input 
            v-model="tournamentUrl" 
            type="text" 
            placeholder="e.g. https://www.chess.com/tournament/ethchess-tuesday-season1-r1"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">EVENT CATEGORY</label>
          <select v-model="eventType" class="form-select">
            <option value="tuesday">EthChess Tuesday</option>
            <option value="friday">Freestyle Friday</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">CUSTOM DISPLAY NAME (OPTIONAL)</label>
          <input 
            v-model="customName" 
            type="text" 
            placeholder="e.g. EthChess Tuesday #3"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'FETCHING & SYNCING...' : 'FETCH & SYNC TOURNAMENT' }}
        </button>

        <button type="button" class="btn-secondary" @click="loadSampleTournament" :disabled="isLoading">
          LOAD DEMO SAMPLE DATA
        </button>
      </div>
    </form>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="['status-box', statusType]">
      {{ statusMessage }}
    </div>

    <!-- Live Preview of Computed Standings -->
    <div v-if="previewStandings.length > 0" class="preview-box">
      <h4 class="preview-title">CALCULATED SCORE RESULTS PREVIEW</h4>
      <table class="preview-table">
        <thead>
          <tr>
            <th>RANK</th>
            <th>PLAYER HANDLE</th>
            <th>SWISS SCORE</th>
            <th>F1 PTS</th>
            <th>PART. BONUS</th>
            <th>TOTAL SCORE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in previewStandings" :key="item.username">
            <td>#{{ item.rank }}</td>
            <td class="handle-txt">@{{ item.username }}</td>
            <td>{{ item.swissPoints }}</td>
            <td>{{ item.rankPoints }} pts</td>
            <td>+{{ item.participationPoints }} pts</td>
            <td class="total-txt">{{ item.totalPoints }} PTS</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['tournament-synced']);

const tournamentUrl = ref('');
const eventType = ref('tuesday');
const customName = ref('');
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('info');
const previewStandings = ref([]);

const syncTournament = async () => {
  if (!tournamentUrl.value.trim()) return;

  isLoading.value = true;
  statusMessage.value = '';
  previewStandings.value = [];

  try {
    const res = await $fetch('/api/sync', {
      method: 'POST',
      body: {
        url: tournamentUrl.value.trim(),
        eventType: eventType.value,
        name: customName.value.trim()
      }
    });

    statusMessage.value = res.message;
    statusType.value = 'success';
    previewStandings.value = res.standingsPreview || [];
    emit('tournament-synced');
  } catch (err) {
    const detailedMsg = err.data?.statusMessage || err.data?.message || err.statusMessage || err.message || 'Failed to sync tournament URL.';
    statusMessage.value = detailedMsg;
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const loadSampleTournament = () => {
  tournamentUrl.value = 'https://www.chess.com/tournament/tuesday';
  customName.value = 'EthChess Tuesday #1 (Demo)';
  eventType.value = 'tuesday';
  statusMessage.value = 'Loaded public Chess.com tournament URL. Click "FETCH & SYNC TOURNAMENT" to process!';
  statusType.value = 'info';
};
</script>

<style scoped>
.sync-card {
  padding: 32px;
  border: 1px solid var(--color-border);
  background: #FFFFFF;
  margin-bottom: 32px;
  border-radius: var(--radius-sharp);
}

.sync-header {
  margin-bottom: 20px;
}

.sync-title {
  font-size: 1.1rem;
  color: var(--color-dark);
}

.sync-sub {
  font-size: 0.85rem;
  color: var(--color-dark-muted);
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

.form-input, .form-select {
  border: 1px solid #D1D5DB;
  background: #FAFAFA;
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-box {
  margin-top: 16px;
  padding: 12px 16px;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
}

.status-box.success {
  background: rgba(0, 168, 107, 0.08);
  color: var(--color-jade-dark);
  border-color: var(--color-jade);
}

.status-box.error {
  background: rgba(226, 114, 91, 0.1);
  color: var(--color-terracotta);
  border-color: var(--color-terracotta);
}

.status-box.info {
  background: #FAFAFA;
  color: var(--color-dark);
}

.preview-box {
  margin-top: 24px;
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
}

.preview-title {
  font-family: var(--font-title);
  font-size: 0.8rem;
  color: var(--color-dark);
  margin-bottom: 12px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
}

.preview-table th {
  background: #FAFAFA;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-title);
  font-size: 0.7rem;
  color: var(--color-dark-muted);
}

.preview-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
}

.handle-txt { color: var(--color-jade); font-weight: 600; }
.total-txt { font-family: var(--font-title); font-weight: 700; color: var(--color-jade); }

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
