<template>
  <div class="sync-card editorial-card">
    <div class="sync-header">
      <div>
        <h3 class="sync-title">CHESS.COM TOURNAMENT SYNC ENGINE</h3>
        <p class="sync-sub">Sync Chess.com official CSV export files (.csv), public URL slugs, or paste standings</p>
      </div>
      
      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button 
          type="button"
          :class="['mode-btn', { active: mode === 'csv' }]"
          @click="mode = 'csv'"
        >
          UPLOAD CHESS.COM CSV
        </button>
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
          PASTE HANDLES
        </button>
      </div>
    </div>

    <!-- Mode 1: Upload Official Chess.com CSV Export File -->
    <div v-if="mode === 'csv'" class="csv-section">
      <div class="info-banner">
        <strong>RECOMMENDED FOR PERFECT STANDINGS:</strong> Upload the official Chess.com CSV export file (e.g. <code>ethchess-tuesdays-6648933.csv</code>). This extracts 100% of all participants, exact Swiss scores, and actual rounds played.
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">EVENT CATEGORY</label>
          <select v-model="eventType" class="form-select">
            <option value="tuesday">EthChess Tuesday</option>
            <option value="friday">Freestyle Friday</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">TOURNAMENT DISPLAY NAME</label>
          <input 
            v-model="csvTournamentName" 
            type="text" 
            placeholder="e.g. EthChess Tuesday #2"
            class="form-input"
          />
        </div>
      </div>

      <!-- Dropzone -->
      <div 
        class="dropzone"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleCsvDrop"
        :class="{ dragging: isDragging }"
        @click="$refs.csvFileInput.click()"
      >
        <input 
          type="file" 
          ref="csvFileInput" 
          accept=".csv"
          class="hidden-input"
          @change="handleCsvSelect"
        />
        <div class="drop-content">
          <p class="drop-text">DRAG & DROP CHESS.COM CSV FILE HERE, OR <span class="browse-link">BROWSE FILES</span></p>
          <span class="file-hint">Supports official Chess.com export format (`Username`, `Score`, `Rk`, `RND1`...`RND9`)</span>
        </div>
      </div>

      <div v-if="parsedCsvItems.length > 0" class="csv-confirm-bar">
        <span>FOUND <strong>{{ parsedCsvItems.length }}</strong> PARTICIPANT STANDINGS IN CSV FILE</span>
        <button class="btn-primary" :disabled="isLoading" @click="submitCsvStandings">
          {{ isLoading ? 'CALCULATING & SAVING...' : 'CONFIRM & SAVE CSV TOURNAMENT' }}
        </button>
      </div>
    </div>

    <!-- Mode 2: Public URL Sync -->
    <form v-else-if="mode === 'url'" @submit.prevent="syncTournament" class="sync-form">
      <div class="info-banner" v-if="networkWarning">
        <strong>NETWORK FIREWALL NOTICE:</strong> Local network firewall blocked <code>api.chess.com</code>. Use the <strong>UPLOAD CHESS.COM CSV</strong> tab above or deploy to Vercel.
      </div>

      <div class="form-grid">
        <div class="form-group url-group">
          <label class="form-label">CHESS.COM TOURNAMENT LINK OR SLUG</label>
          <input 
            v-model="tournamentUrl" 
            type="text" 
            placeholder="e.g. ethchess-tuesdays-6648933 or full URL"
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
            placeholder="e.g. EthChess Tuesday #2"
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

    <!-- Mode 3: Live Club / Offline Quick Input -->
    <form v-else @submit.prevent="submitManualStandings" class="sync-form">
      <div class="info-banner">
        <strong>PASTE STANDINGS:</strong> Paste player handles in rank order below.
      </div>

      <div class="form-grid">
        <div class="form-group url-group">
          <label class="form-label">TOURNAMENT NAME / TITLE</label>
          <input 
            v-model="manualName" 
            type="text" 
            placeholder="e.g. EthChess Tuesday #2"
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
        <label class="form-label">PASTE FINISH STANDINGS (HANDLES IN RANK ORDER, ONE PER LINE)</label>
        <textarea 
          v-model="manualHandlesText"
          rows="6"
          placeholder="e.g.&#10;Josephkifle2500&#10;xDanielB&#10;binyamash&#10;nxeno&#10;josh_147"
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
            <th>ROUNDS PLAYED</th>
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
            <td>{{ item.roundsPlayed }}/9</td>
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
import Papa from 'papaparse';

const emit = defineEmits(['tournament-synced']);

const mode = ref('csv');
const tournamentUrl = ref('');
const eventType = ref('tuesday');
const customName = ref('');
const csvTournamentName = ref('');
const manualName = ref('');
const manualRounds = ref(9);
const manualHandlesText = ref('');
const networkWarning = ref(false);

const isDragging = ref(false);
const csvFileInput = ref(null);
const parsedCsvItems = ref([]);

const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('info');
const previewStandings = ref([]);

const handleCsvSelect = (e) => {
  const file = e.target.files[0];
  if (file) parseCsvFile(file);
};

const handleCsvDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file) parseCsvFile(file);
};

const parseCsvFile = (file) => {
  statusMessage.value = '';
  parsedCsvItems.value = [];

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const items = [];
      results.data.forEach((row, idx) => {
        const username = row['Username'] || row['username'] || row['User Name'] || '';
        const scoreVal = row['Score'] || row['score'] || row['Points'] || '0';
        const score = parseFloat(scoreVal);

        // Count non-empty, non-U-- round entries
        let roundsCount = 0;
        for (let r = 1; r <= 15; r++) {
          const val = row[`RND${r}`] || row[`Rnd${r}`] || row[`Round${r}`];
          if (val && typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed && trimmed !== 'U--' && trimmed !== '-') {
              roundsCount++;
            }
          }
        }

        if (username && username.trim()) {
          items.push({
            username: username.trim(),
            swissPoints: isNaN(score) ? 0 : score,
            roundsPlayed: roundsCount || 9
          });
        }
      });

      parsedCsvItems.value = items;
      if (!csvTournamentName.value) {
        csvTournamentName.value = file.name.replace(/\.[^/.]+$/, '');
      }

      if (items.length > 0) {
        statusMessage.value = `Parsed ${items.length} participant standings from CSV file. Click "CONFIRM & SAVE CSV TOURNAMENT" below.`;
        statusType.value = 'success';
      } else {
        statusMessage.value = 'Could not find participant rows in CSV file. Ensure spreadsheet has a "Username" column.';
        statusType.value = 'error';
      }
    }
  });
};

const submitCsvStandings = async () => {
  if (parsedCsvItems.value.length === 0) return;

  isLoading.value = true;
  statusMessage.value = '';
  previewStandings.value = [];

  try {
    const res = await $fetch('/api/sync', {
      method: 'POST',
      body: {
        eventType: eventType.value,
        name: csvTournamentName.value.trim() || 'EthChess Tournament',
        csvStandings: parsedCsvItems.value
      }
    });

    statusMessage.value = res.message;
    statusType.value = 'success';
    previewStandings.value = res.standingsPreview || [];
    parsedCsvItems.value = [];
    emit('tournament-synced');
  } catch (err) {
    const detailedMsg = err.data?.statusMessage || err.data?.message || err.statusMessage || err.message || 'Failed to save CSV tournament.';
    statusMessage.value = detailedMsg;
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

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
      statusMessage.value = 'Local network firewall blocked outbound connection to api.chess.com. Use the UPLOAD CHESS.COM CSV tab above.';
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

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 2fr;
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

.dropzone {
  border: 1px dashed #D1D5DB;
  padding: 28px;
  text-align: center;
  background: #FAFAFA;
  cursor: pointer;
  border-radius: var(--radius-sharp);
  transition: all 0.15s ease;
}

.dropzone:hover, .dropzone.dragging {
  border-color: var(--color-jade);
  background: rgba(0, 168, 107, 0.04);
}

.hidden-input {
  display: none;
}

.drop-text {
  font-family: var(--font-title);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 4px;
}

.browse-link {
  color: var(--color-jade);
  text-decoration: underline;
}

.file-hint {
  font-size: 0.78rem;
  color: var(--color-dark-muted);
}

.csv-confirm-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-family: var(--font-title);
  font-size: 0.75rem;
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
  .form-grid, .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
