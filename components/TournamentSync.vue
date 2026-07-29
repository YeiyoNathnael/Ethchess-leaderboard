<template>
  <div class="sync-card editorial-card">
    <div class="sync-header">
      <div>
        <h3 class="sync-title">CHESS.COM TOURNAMENT LINK SYNC ENGINE</h3>
        <p class="sync-sub">Sync public daily tournaments or enter live/club event standings to compute EthChess F1 points</p>
      </div>
      
      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button 
          type="button"
          :class="['mode-btn', { active: mode === 'url' }]"
          @click="mode = 'url'"
        >
          PUBLIC URL / SLUG
        </button>
        <button 
          type="button"
          :class="['mode-btn', { active: mode === 'manual' }]"
          @click="mode = 'manual'"
        >
          LIVE / OFFLINE INPUT
        </button>
      </div>
    </div>

    <!-- Mode 1: Public URL Sync -->
    <form v-if="mode === 'url'" @submit.prevent="syncTournament" class="sync-form">
      <div class="info-banner" v-if="networkWarning">
        <strong>NETWORK FIREWALL NOTICE:</strong> If your local network/ISP blocks <code>api.chess.com</code>, deploy to Vercel (cloud environment) or use the <strong>LIVE / OFFLINE INPUT</strong> tab.
      </div>

      <div class="form-grid">
        <div class="form-group url-group">
          <label class="form-label">CHESS.COM TOURNAMENT LINK OR SLUG</label>
          <input 
            v-model="tournamentUrl" 
            type="text" 
            placeholder="e.g. ethchess-tuesday-6629639 or full URL"
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
            placeholder="e.g. EthChess Tuesday #1"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'FETCHING & SYNCING...' : 'FETCH & SYNC TOURNAMENT' }}
        </button>
      </div>
    </form>

    <!-- Mode 2: Live Club / Offline Quick Input -->
    <form v-else @submit.prevent="submitManualStandings" class="sync-form">
      <div class="info-banner">
        <strong>BYPASS FIREWALL & LIVE LIMITS:</strong> Paste player handles in rank order below. This calculates F1 placement points and saves directly to Turso DB without needing an external network request to Chess.com.
      </div>

      <div class="form-grid">
        <div class="form-group url-group">
          <label class="form-label">TOURNAMENT NAME / TITLE</label>
          <input 
            v-model="manualName" 
            type="text" 
            placeholder="e.g. EthChess Tuesday #1 (6629639)"
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
          <label class="form-label">TOTAL ROUNDS COMPLETED</label>
          <input 
            v-model.number="manualRounds" 
            type="number" 
            min="1"
            max="15"
            class="form-input"
            required
          />
        </div>
      </div>

      <div class="form-group full-width">
        <label class="form-label">PASTE FINISH STANDINGS (HANDLES IN RANK ORDER, ONE PER LINE OR COMMA SEPARATED)</label>
        <textarea 
          v-model="manualHandlesText"
          rows="6"
          placeholder="e.g.&#10;xdanielb&#10;mrhn11&#10;fula_710&#10;razak-basit&#10;yeabx&#10;pattydaty&#10;josh_147&#10;tebareka"
          class="form-textarea"
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'CALCULATING & SAVING...' : 'CALCULATE & SAVE STANDINGS' }}
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

const mode = ref('url');
const tournamentUrl = ref('');
const eventType = ref('tuesday');
const customName = ref('');
const manualName = ref('');
const manualRounds = ref(9);
const manualHandlesText = ref('');
const networkWarning = ref(false);

const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('info');
const previewStandings = ref([]);

const syncTournament = async () => {
  if (!tournamentUrl.value.trim()) return;

  isLoading.value = true;
  statusMessage.value = '';
  networkWarning.value = false;
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
    const rawMsg = err.data?.statusMessage || err.data?.message || err.statusMessage || err.message || 'Failed to sync tournament URL.';
    
    if (rawMsg.includes('fetch failed') || rawMsg.includes('ECONNRESET')) {
      networkWarning.value = true;
      statusMessage.value = 'Local network firewall blocked outbound connection to api.chess.com. Either deploy to Vercel (cloud environment) or use the LIVE / OFFLINE INPUT tab above.';
    } else {
      statusMessage.value = rawMsg;
    }
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const submitManualStandings = async () => {
  if (!manualName.value.trim() || !manualHandlesText.value.trim()) return;

  isLoading.value = true;
  statusMessage.value = '';
  previewStandings.value = [];

  const handles = manualHandlesText.value
    .split(/[\n,]+/)
    .map(h => h.trim().replace(/^@/, ''))
    .filter(Boolean);

  if (handles.length === 0) {
    statusMessage.value = 'Please enter at least one Chess.com handle in rank order.';
    statusType.value = 'error';
    isLoading.value = false;
    return;
  }

  try {
    const res = await $fetch('/api/sync', {
      method: 'POST',
      body: {
        eventType: eventType.value,
        name: manualName.value.trim(),
        manualHandles: handles,
        roundsPlayed: manualRounds.value || 9
      }
    });

    statusMessage.value = res.message;
    statusType.value = 'success';
    previewStandings.value = res.standingsPreview || [];
    emit('tournament-synced');
  } catch (err) {
    const detailedMsg = err.data?.statusMessage || err.data?.message || err.statusMessage || err.message || 'Failed to save standings.';
    statusMessage.value = detailedMsg;
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.sync-title {
  font-size: 1.1rem;
  color: var(--color-dark);
}

.sync-sub {
  font-size: 0.85rem;
  color: var(--color-dark-muted);
}

.mode-toggle {
  display: flex;
  gap: 4px;
  background: #FAFAFA;
  border: 1px solid var(--color-border);
  padding: 3px;
  border-radius: var(--radius-sharp);
}

.mode-btn {
  background: transparent;
  border: none;
  font-family: var(--font-title);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--color-dark-muted);
  border-radius: var(--radius-sharp);
  transition: all 0.15s ease;
}

.mode-btn.active {
  background: var(--color-dark);
  color: #FFFFFF;
}

.info-banner {
  background: rgba(0, 168, 107, 0.05);
  border: 1px solid var(--color-border);
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--color-dark);
  margin-bottom: 16px;
  border-radius: var(--radius-sharp);
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.full-width {
  margin-bottom: 20px;
}

.form-label {
  font-family: var(--font-title);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}

.form-input, .form-select, .form-textarea {
  border: 1px solid #D1D5DB;
  background: #FAFAFA;
  font-family: var(--font-body);
  padding: 8px 12px;
  border-radius: var(--radius-sharp);
  outline: none;
}

.form-textarea {
  resize: vertical;
  font-family: monospace;
  font-size: 0.88rem;
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
