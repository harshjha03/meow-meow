import { useState } from 'react'
import { addMock } from '../lib/storage'
import { todayStr } from '../lib/dates'
import { useToast } from '../context/ToastContext'
import Segmented from './Segmented'

const TYPE_OPTS = [
  { value: 'Full Mock', label: 'Full Mock' },
  { value: 'Sectional', label: 'Sectional' },
  { value: 'Topic Test', label: 'Topic Test' },
]
const blank = { type: 'Full Mock', name: '', score: '', percentile: '', qa: '', varc: '', lrdi: '' }

export default function TestForm({ onSaved }) {
  const toast = useToast()
  const [f, setF] = useState(blank)
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }))

  function submit() {
    if (!f.percentile && !f.score) {
      toast('Enter at least a score or percentile', 'error')
      return
    }
    addMock({
      date: todayStr(),
      type: f.type,
      name: f.name.trim() || f.type,
      score: parseFloat(f.score) || 0,
      percentile: parseFloat(f.percentile) || 0,
      qa_score: parseFloat(f.qa) || 0,
      varc_score: parseFloat(f.varc) || 0,
      lrdi_score: parseFloat(f.lrdi) || 0,
      notes: '',
    })
    toast('Test result saved ✓', 'success')
    setF(blank)
    onSaved?.()
  }

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div>
        <div className="label">Type</div>
        <Segmented variant="chip" options={TYPE_OPTS} value={f.type} onChange={(v) => upd('type', v)} />
      </div>
      <div>
        <div className="label">Test name</div>
        <input className="mm-in" placeholder="e.g. SIMCAT 7" value={f.name} onChange={(e) => upd('name', e.target.value)} />
      </div>
      <div className="flex gap-3">
        <NumField label="Score" v={f.score} on={(v) => upd('score', v)} />
        <NumField label="Percentile" v={f.percentile} on={(v) => upd('percentile', v)} step="0.01" />
      </div>
      <div className="flex gap-3">
        <NumField label="QA" labelColor="#6C4DF6" v={f.qa} on={(v) => upd('qa', v)} />
        <NumField label="VARC" labelColor="#FF7A45" v={f.varc} on={(v) => upd('varc', v)} />
        <NumField label="LRDI" labelColor="#13B981" v={f.lrdi} on={(v) => upd('lrdi', v)} />
      </div>
      <button onClick={submit} className="rounded-[10px] bg-accent py-[15px] text-center text-[15px] font-semibold text-white transition active:scale-[0.99]">
        Save test result
      </button>
    </div>
  )
}

function NumField({ label, v, on, labelColor, step }) {
  return (
    <div className="flex-1">
      <div className="label" style={labelColor ? { color: labelColor } : undefined}>{label}</div>
      <input type="number" inputMode="decimal" step={step} className="mm-in" placeholder="0" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  )
}
