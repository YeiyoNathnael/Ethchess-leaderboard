<template>
  <div class="importer-card editorial-card">
    <div class="importer-header">
      <div>
        <h3 class="importer-title">REGISTERED PLAYERS ROSTER IMPORTER</h3>
        <p class="importer-sub">Upload Google Form responses (.xlsx or .csv) to seed registered player usernames</p>
      </div>
    </div>

    <!-- Dropzone area -->
    <div 
      class="dropzone"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleFileDrop"
      :class="{ dragging: isDragging }"
    >
      <input 
        type="file" 
        ref="fileInput" 
        accept=".csv, .xlsx, .xls"
        class="hidden-input"
        @change="handleFileSelect"
      />

      <div class="drop-content" @click="$refs.fileInput.click()">
        <p class="drop-text">DRAG & DROP GOOGLE FORM SPREADSHEET HERE, OR <span class="browse-link">BROWSE FILES</span></p>
        <span class="file-hint">Supports official Google Form export format (`Full Name`, `Chess.com Username`, `Telegram Username`)</span>
      </div>
    </div>

    <!-- Parsed Preview Table -->
    <div v-if="parsedPlayers.length > 0" class="preview-section">
      <div class="preview-bar">
        <span>FOUND <strong>{{ parsedPlayers.length }}</strong> VALID REGISTERED PLAYERS TO IMPORT</span>
        <button class="btn-primary" :disabled="isSubmitting" @click="submitRoster">
          {{ isSubmitting ? 'IMPORTING...' : 'CONFIRM & SAVE ROSTER' }}
        </button>
      </div>

      <div class="preview-table-box">
        <table class="preview-table">
          <thead>
            <tr>
              <th>FULL NAME</th>
              <th>TELEGRAM / CONTACT</th>
              <th>CHESS.COM HANDLE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in parsedPlayers.slice(0, 10)" :key="idx">
              <td>{{ p.name }}</td>
              <td>{{ p.email }}</td>
              <td class="handle-col">@{{ p.chesscom_username }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="parsedPlayers.length > 10" class="more-rows-hint">
          ... and {{ parsedPlayers.length - 10 }} more rows
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="['status-box', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const emit = defineEmits(['roster-updated']);

const isDragging = ref(false);
const isSubmitting = ref(false);
const fileInput = ref(null);
const parsedPlayers = ref([]);
const statusMessage = ref('');
const statusType = ref('info');

const processRawData = (rows) => {
  const players = [];
  
  rows.forEach(row => {
    const keys = Object.keys(row);
    let name = '';
    let email = '';
    let handle = '';

    keys.forEach(k => {
      const lowerK = k.toLowerCase().replace(/\s+/g, ' ');

      if (lowerK.includes('full name') || lowerK.includes('name')) {
        name = row[k];
      } else if (lowerK.includes('telegram') || lowerK.includes('phone') || lowerK.includes('email')) {
        if (!email) email = row[k];
      } else if (lowerK.includes('chess.com') || lowerK.includes('chess') || lowerK.includes('handle')) {
        handle = row[k];
      }
    });

    if (!handle && keys.length >= 2) {
      name = row[keys[1]] || row[keys[0]] || '';
      handle = row[keys[5]] || row[keys[2]] || row[keys[1]] || '';
    }

    const cleanHandle = String(handle || '').trim().replace(/^@/, '');
    const invalidValues = ['n/a', 'na', 'none', '-', 'no', 'null', 'undefined', ''];

    if (cleanHandle && !invalidValues.includes(cleanHandle.toLowerCase())) {
      players.push({
        name: String(name || 'Chess Player').trim(),
        email: String(email || '-').trim(),
        chesscom_username: cleanHandle
      });
    }
  });

  parsedPlayers.value = players;
  if (players.length === 0) {
    statusMessage.value = 'Could not find valid Chess.com handles in file. Ensure spreadsheet includes the Google Form "Chess.com Username" column.';
    statusType.value = 'error';
  } else {
    statusMessage.value = `Successfully parsed ${players.length} valid registered players from spreadsheet. Click "Confirm & Save Roster" below.`;
    statusType.value = 'success';
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) parseFile(file);
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) parseFile(file);
};

const parseFile = (file) => {
  statusMessage.value = '';
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv') {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processRawData(results.data);
      }
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(firstSheet);
      processRawData(json);
    };
    reader.readAsArrayBuffer(file);
  } else {
    statusMessage.value = 'Unsupported file format. Please upload a .csv or .xlsx file.';
    statusType.value = 'error';
  }
};

const submitRoster = async () => {
  if (parsedPlayers.value.length === 0) return;

  isSubmitting.value = true;
  statusMessage.value = '';

  try {
    const res = await $fetch('/api/players', {
      method: 'POST',
      body: { players: parsedPlayers.value }
    });

    const msg = res?.message || `Successfully imported ${parsedPlayers.value.length} players`;
    const total = res?.totalRegistered ?? parsedPlayers.value.length;

    statusMessage.value = `${msg}. Total registered players: ${total}`;
    statusType.value = 'success';
    parsedPlayers.value = [];
    emit('roster-updated');
  } catch (err) {
    statusMessage.value = err.message || 'Failed to import roster.';
    statusType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.importer-card {
  padding: 32px;
  border: 1px solid var(--color-border);
  background: #FFFFFF;
  margin-bottom: 32px;
  border-radius: var(--radius-sharp);
}

.importer-header {
  margin-bottom: 20px;
}

.importer-title {
  font-size: 1.1rem;
  color: var(--color-dark);
}

.importer-sub {
  font-size: 0.85rem;
  color: var(--color-dark-muted);
}

.dropzone {
  border: 1px dashed #D1D5DB;
  padding: 32px;
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

.preview-section {
  margin-top: 24px;
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
}

.preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-family: var(--font-title);
  font-size: 0.75rem;
}

.preview-table-box {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  overflow: hidden;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
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

.handle-col {
  color: var(--color-jade);
  font-weight: 600;
}

.more-rows-hint {
  padding: 8px 12px;
  font-size: 0.78rem;
  color: var(--color-dark-muted);
  background: #FAFAFA;
  text-align: center;
}

.status-box {
  margin-top: 16px;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 500;
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
</style>
