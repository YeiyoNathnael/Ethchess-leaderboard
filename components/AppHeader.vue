<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand-area" @click="$emit('change-tab', 'overall')">
        <EthChessLogo :size="70" class="header-logo" />
        
        <div class="brand-text">
          <div class="brand-title-row">
            <h1 class="brand-title">ETHCHESS™</h1>
            <span class="brand-badge">LEAGUE</span>
          </div>
          <span class="brand-tagline">AUTOMATIC LEADERBOARD</span>
        </div>
      </div>

      <nav class="nav-links">
        <button 
          :class="['nav-btn', { active: activeTab === 'overall' }]"
          @click="$emit('change-tab', 'overall')"
        >
          OVERALL
        </button>

        <button 
          :class="['nav-btn', { active: activeTab === 'tuesday' }]"
          @click="$emit('change-tab', 'tuesday')"
        >
          TUESDAY
        </button>

        <button 
          :class="['nav-btn', { active: activeTab === 'friday' }]"
          @click="$emit('change-tab', 'friday')"
        >
          FRIDAY
        </button>

        <button 
          :class="['nav-btn', 'rules-btn', { active: activeTab === 'rules' }]"
          @click="$emit('change-tab', 'rules')"
        >
          RULES
        </button>

        <button 
          :class="['nav-btn', 'admin-btn', { active: activeTab === 'admin' }]"
          @click="$emit('request-admin-access')"
        >
          <Lock v-if="!isAdminAuthenticated" class="nav-icon" />
          <Unlock v-else class="nav-icon auth-icon" />
          ADMIN
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { Lock, Unlock } from 'lucide-vue-next';
import EthChessLogo from '~/components/EthChessLogo.vue';

defineProps({
  activeTab: {
    type: String,
    default: 'overall'
  },
  isAdminAuthenticated: {
    type: Boolean,
    default: false
  }
});

defineEmits(['change-tab', 'request-admin-access']);
</script>

<style scoped>
.app-header {
  background: #FFFFFF;
  border-bottom: 1px solid var(--color-border);
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-dark);
  line-height: 1.1;
  letter-spacing: 0.01em;
}

.brand-badge {
  background-color: var(--color-jade);
  color: #FFFFFF;
  font-family: var(--font-title);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 5px;
  border-radius: 2px;
}

.brand-tagline {
  font-family: var(--font-title);
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--color-dark-muted);
  letter-spacing: 0.04em;
  display: block;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  padding-bottom: 2px;
}

.nav-links::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.nav-btn {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--color-dark-muted);
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-btn:hover {
  color: var(--color-dark);
}

.nav-btn.active {
  color: var(--color-dark);
  border-bottom-color: var(--color-jade);
}

.nav-icon {
  width: 13px;
  height: 13px;
}

.auth-icon {
  color: var(--color-jade);
}

.admin-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  padding: 5px 10px;
}

.admin-btn.active {
  background: var(--color-dark);
  color: #FFFFFF;
  border-color: var(--color-dark);
}

@media (max-width: 768px) {
  .app-header {
    padding: 10px 14px;
  }

  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .brand-area {
    justify-content: center;
  }

  .nav-links {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
