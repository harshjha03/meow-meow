import { useState } from 'react'
import { addSession } from '../lib/storage'
import { todayStr } from '../lib/dates'
import { useToast } from '../context/ToastContext'
import Segmented from './Segmented'

const SUBJECT_OPTS = [
  { value: 'QA', label: 'QA' },
  { value: 'VARC', label: 'VARC' },
  { value: 'LRDI', label: 'LRDI' },
]
const blank = { subject: 'QA', topic: '', attempted: '', correct: '', duration: '', notes: '' }

export default function SessionForm({ onSaved }) {
  const toast = useToast()
  const [f, setF] = useState(blank)
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }))

  function submit() {
    const att = parseInt(f.attempted) || 0
    if (att <= 0) {
      toast('Enter how many questions you attempted', 'error')
      return
    }
    const corr = Math.min(att, parseInt(f.correct) || 0)
    addSession({
      date: todayStr(),
      subject: f.subject,
      topic: f.topic.trim() || 'General practice',
      questions_attempted: att,
      questions_correct: corr,
      duration_min: parseInt(f.duration) || 0,
      notes: f.notes.trim(),
    })
    toast('Session logged ✓ streak is safe', 'success')
    setF(blank)
    onSaved?.()
  }

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div>
        <div className="label">Section</div>
        <Segmented variant="chip" options={SUBJECT_OPTS} value={f.subject} onChange={(v) => upd('subject', v)} />
      </div>
      <div>
        <div className="label">Topic</div>
        <input className="mm-in" placeholder="e.g. Geometry, Para Jumbles" value={f.topic} onChange={(e) => upd('topic', e.target.value)} />
      </div>
      <div className="flex gap-3">
        <NumField label="Attempted" v={f.attempted} on={(v) => upd('attempted', v)} />
        <NumField label="Correct" v={f.correct} on={(v) => upd('correct', v)} />
        <NumField label="Minutes" v={f.duration} on={(v) => upd('duration', v)} />
      </div>
      <div>
        <div className="label">Notes <span className="font-normal text-[#b6b3ab]">(optional)</span></div>
        <input className="mm-in" placeholder="What tripped you up?" value={f.notes} onChange={(e) => upd('notes', e.target.value)} />
      </div>
      <button onClick={submit} className="rounded-[10px] bg-accent py-[15px] text-center text-[15px] font-semibold text-white transition active:scale-[0.99]">
        Log session
      </button>
    </div>
  )
}

function NumField({ label, v, on }) {
  return (
    <div className="flex-1">
      <div className="label">{label}</div>
      <input type="number" inputMode="numeric" className="mm-in" placeholder="0" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  )
}
