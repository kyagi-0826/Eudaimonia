<template>
    <div class="relative inline-block" ref="root">
        <div class="flex items-center gap-2">
            <input :class="inputClass" :placeholder="props.placeholder || 'YYYY/MM/DD'" :value="displayValue" readonly
                @focus="openPopup" />
            <button type="button" class="px-2 py-2 rounded bg-gray-100 hover:bg-gray-200" @click="togglePopup"
                aria-label="open calendar">
                📅
            </button>
        </div>

        <div v-if="isOpen" class="absolute z-50 mt-2 p-3 bg-white border rounded shadow-lg" role="dialog"
            aria-modal="false">
            <div class="flex items-center justify-between mb-2 gap-2">
                <button class="px-2" @click="prevMonth">‹</button>

                <div class="flex-1 flex flex-col items-center">
                    <div class="flex items-center gap-4">
                        <select v-model.number="selectedYear" class="border rounded px-3 py-1 text-sm w-40 text-center">
                            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                        </select>
                        <select v-model.number="selectedMonth"
                            class="border rounded px-3 py-1 text-sm w-28 text-center">
                            <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
                        </select>
                    </div>
                </div>

                <button class="px-2" @click="nextMonth">›</button>
            </div>
            <div class="grid grid-cols-7 gap-1 text-xs text-center">
                <div class="font-semibold">月</div>
                <div class="font-semibold">火</div>
                <div class="font-semibold">水</div>
                <div class="font-semibold">木</div>
                <div class="font-semibold">金</div>
                <div class="font-semibold text-blue-600">土</div>
                <div class="font-semibold text-red-600">日</div>

                <template v-for="cell in calendarCells" :key="cell.key">
                    <button class="p-2 rounded hover:bg-gray-100 focus:outline-none" :class="dayClass(cell)"
                        :disabled="!cell.inMonth" @click="onSelect(cell)">
                        {{ cell.day }}
                    </button>
                </template>
            </div>
            <div class="mt-3 flex justify-end gap-2">
                <button type="button" class="px-3 py-1 rounded border text-sm" @click="onCancel">Cancel</button>
                <button type="button" class="px-3 py-1 rounded bg-blue-600 text-white text-sm" @click="onOk">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import type { SingleValue, RangeValue } from './DatePicker.types';
import { toYYYYMMDD, fromYYYYMMDD, formatDisplay, isWeekendYYYYMMDD } from './DatePicker.types';

// props
const props = withDefaults(defineProps<{
    mode?: 'single' | 'range';
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    locale?: string;
    variant?: 'tooltip' | 'inline';
}>(), {
    mode: 'single',
    placeholder: '',
    locale: 'ja',
    variant: 'tooltip'
});

// v-model via defineModel
type VM = SingleValue | RangeValue;
const model = defineModel<VM>('modelValue');

const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);

// month state
const visible = ref(new Date());

// year/month select state
const selectedYear = ref(visible.value.getFullYear());
const selectedMonth = ref(visible.value.getMonth() + 1); // 1..12

const yearOptions = computed(() => {
    const y = new Date().getFullYear();
    const opts: number[] = [];
    for (let i = y - 5; i <= y + 5; i++) opts.push(i);
    return opts;
});

const inputClass = computed(() => {
    // single: smaller, range: wider; center the text
    return props.mode === 'range'
        ? 'px-3 py-2 rounded border bg-white text-sm cursor-default w-58 text-center'
        : 'px-3 py-2 rounded border bg-white text-sm cursor-default w-48 text-center';
});

// sync selected -> visible
watch([selectedYear, selectedMonth], ([y, m]: [number, number]) => {
    visible.value = new Date(y, m - 1, 1);
});

// sync visible -> selected when visible changes externally
watch(visible, (v: Date) => {
    selectedYear.value = v.getFullYear();
    selectedMonth.value = v.getMonth() + 1;
});

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function generateCalendar(date: Date) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startWeek = start.getDay(); // 0..6 (Sun..Sat)
    const daysInMonth = end.getDate();

    const cells: Array<{ key: string; date: Date; day: number; inMonth: boolean }> = [];
    // previous month's tail
    for (let i = 0; i < startWeek; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() - (startWeek - i));
        cells.push({ key: `p-${d.toISOString()}`, date: d, day: d.getDate(), inMonth: false });
    }
    // current month
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(date.getFullYear(), date.getMonth(), i);
        cells.push({ key: `c-${d.toISOString()}`, date: d, day: i, inMonth: true });
    }
    // fill to complete 6 rows (6*7 = 42)
    while (cells.length % 7 !== 0) {
        const last = cells[cells.length - 1].date;
        const d = new Date(last);
        d.setDate(last.getDate() + 1);
        cells.push({ key: `n-${d.toISOString()}`, date: d, day: d.getDate(), inMonth: false });
    }
    // ensure at least 42
    while (cells.length < 42) {
        const last = cells[cells.length - 1].date;
        const d = new Date(last);
        d.setDate(last.getDate() + 1);
        cells.push({ key: `n2-${d.toISOString()}`, date: d, day: d.getDate(), inMonth: false });
    }
    return cells;
}

const calendarCells = computed(() => generateCalendar(visible.value).map((c) => ({ key: c.key, date: c.date, day: c.day, inMonth: c.inMonth })));

function dayClass(cell: { date: Date; inMonth: boolean }) {
    const ymd = toYYYYMMDD(cell.date);
    const weekend = isWeekendYYYYMMDD(ymd);

    const classes: string[] = [];
    if (!cell.inMonth) classes.push('opacity-50');

    // weekend base colors
    if (weekend === 'sat') classes.push('bg-blue-100');
    if (weekend === 'sun') classes.push('bg-red-100');

    // prefer pending selections (interim) so user sees selection before OK
    let selFrom: string | undefined = undefined;
    let selTo: string | undefined = undefined;
    if (props.mode === 'single') {
        if (pendingSingle.value) {
            selFrom = pendingSingle.value;
        } else {
            const v = (model as any).value as VM;
            if (typeof v === 'string') selFrom = v as string;
        }
    } else {
        // range: prefer pendingRange if has values
        if (pendingRange.value && (pendingRange.value.from || pendingRange.value.to)) {
            selFrom = pendingRange.value.from;
            selTo = pendingRange.value.to;
        } else {
            const v = (model as any).value as VM;
            if (v && typeof v === 'object') {
                const rv = v as RangeValue;
                selFrom = rv ? rv.from : undefined;
                selTo = rv ? rv.to : undefined;
            }
        }
    }

    // apply selection classes (after weekend so selection overrides)
    if (props.mode === 'single') {
        if (selFrom && ymd === selFrom) {
            classes.push('bg-blue-600', 'text-white');
        }
    } else {
        if (selFrom && selTo) {
            if (selFrom <= ymd && ymd <= selTo) {
                // in range
                classes.push('bg-blue-200');
            }
            if (ymd === selFrom) classes.push('bg-blue-600', 'text-white');
            if (ymd === selTo) classes.push('bg-blue-700', 'text-white');
        } else if (selFrom && !selTo) {
            // only start selected
            if (ymd === selFrom) classes.push('bg-blue-600', 'text-white');
        }
    }

    return classes.join(' ');
}

function togglePopup() {
    isOpen.value = !isOpen.value;
}
function openPopup() {
    isOpen.value = true;
}
function closePopup() {
    isOpen.value = false;
}

function prevMonth() {
    const d = visible.value;
    visible.value = new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function nextMonth() {
    const d = visible.value;
    visible.value = new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

// selection logic
const pendingRange = ref<{ from?: string; to?: string }>({});
const pendingSingle = ref<string | null>(null);

function onSelect(cell: { date: Date; inMonth: boolean }) {
    if (!cell.inMonth) return;
    const ymd = toYYYYMMDD(cell.date);
    if (props.mode === 'single') {
        // don't auto-close; set pending and wait for OK
        pendingSingle.value = ymd;
        return;
    }

    // range mode: set pending range without committing
    if (!pendingRange.value.from || (pendingRange.value.from && pendingRange.value.to)) {
        // start new range
        pendingRange.value = { from: ymd, to: undefined };
    } else if (pendingRange.value.from && !pendingRange.value.to) {
        // set to
        let from = pendingRange.value.from as string;
        let to = ymd;
        if (from > to) {
            const tmp = from;
            from = to;
            to = tmp;
        }
        pendingRange.value = { from, to };
    }
}

function onOk() {
    if (props.mode === 'single') {
        if (pendingSingle.value) {
            (model as any).value = pendingSingle.value as any;
            pendingSingle.value = null;
        }
    } else {
        if (pendingRange.value.from && pendingRange.value.to) {
            (model as any).value = { from: pendingRange.value.from, to: pendingRange.value.to } as any;
            pendingRange.value = {};
        }
    }
    closePopup();
}

function onCancel() {
    // clear pending selections
    pendingSingle.value = null;
    pendingRange.value = {};
    closePopup();
}

const displayValue = computed(() => {
    const v = (model as any).value as VM;
    if (!v) return '';
    if (props.mode === 'single') {
        const s = v as string;
        return formatDisplay(s as string);
    }
    const r = v as RangeValue;
    if (!r) return '';
    const from = r.from ? formatDisplay(r.from) : '';
    const to = r.to ? formatDisplay(r.to) : '';
    return from && to ? `${from} — ${to}` : from || '';
});

// click outside to close
function onDocumentClick(e: MouseEvent) {
    if (!root.value) return;
    if (!(e.target instanceof Node)) return;
    if (!root.value.contains(e.target)) {
        closePopup();
    }
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick);
});

</script>

<style scoped>
/* minimal styles; project uses Tailwind, but keep these small fallbacks */
</style>
