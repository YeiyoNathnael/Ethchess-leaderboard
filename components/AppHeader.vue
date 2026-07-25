<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand-area" @click="$emit('change-tab', 'overall')">
        <EthChessLogo :size="38" />
        <div class="brand-text">
          <div class="brand-title-row">
            <h1 class="brand-title">ETHCHESS™</h1>
            <span class="brand-badge">LEAGUE</span>
          </div>
          <span class="brand-tagline">OFFICIAL AUTOMATIC LEADERBOARD SYSTEM</span>
        </div>
      </div>

      <nav class="nav-links">
        <button 
          :class="['nav-btn', { active: activeTab === 'overall' }]"
          @click="$emit('change-tab', 'overall')"
        >
          OVERALL SEASON
        </button>

        <button 
          :class="['nav-btn', { active: activeTab === 'tuesday' }]"
          @click="$emit('change-tab', 'tuesday')"
        >
          ETHCHESS TUESDAY
        </button>

        <button 
          :class="['nav-btn', { active: activeTab === 'friday' }]"
          @click="$emit('change-tab', 'friday')"
        >
          FREESTYLE FRIDAY
        </button>

        <button 
          :class="['nav-btn', 'rules-btn', { active: activeTab === 'rules' }]"
          @click="$emit('change-tab', 'rules')"
        >
          SCORING RULES
        </button>

        <button 
          :class="['nav-btn', 'admin-btn', { active: activeTab === 'admin' }]"
          @click="$emit('request-admin-access')"
        >
          <Lock v-if="!isAdminAuthenticated" class="nav-icon" />
          <Unlock v-else class="nav-icon auth-icon" />
          ADMIN PORTAL
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
  padding: 16px 32px;
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
  gap: 20px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.brand-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-dark);
  line-height: 1.1;
  letter-spacing: 0.01em;
}

.brand-badge {
  background-color: var(--color-jade);
  color: #FFFFFF;
  font-family: var(--font-title);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 2px;
}

.brand-tagline {
  font-family: var(--font-title);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-dark-muted);
  letter-spacing: 0.04em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.nav-btn {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-title);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-dark-muted);
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
  border-radius: 0px;
}

.nav-btn:hover {
  color: var(--color-dark);
}

.nav-btn.active {
  color: var(--color-dark);
  border-bottom-color: var(--color-jade);
  background: transparent;
}

.nav-icon {
  width: 14px;
  height: 14px;
}

.auth-icon {
  color: var(--color-jade);
}

.admin-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sharp);
  padding: 6px 12px;
}

.admin-btn.active {
  background: var(--color-dark);
  color: #FFFFFF;
  border-color: var(--color-dark);
}

@media (max-width: 900px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .nav-links {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
