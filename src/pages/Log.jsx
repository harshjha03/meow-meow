import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Segmented from '../components/Segmented'
import SessionForm from '../components/SessionForm'
import TestForm from '../components/TestForm'

const TABS = [
  { value: 'practice', label: 'Practice' },
  { value: 'test', label: 'Test / Mock' },
]

export default function Log() {
  const [tab, setTab] = useState('practice')
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-[560px] animate-fade-up flex-col gap-4">
      <h1 className="text-[23px] font-bold tracking-[-.5px] text-ink md:hidden">Log a session</h1>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      {tab === 'practice' ? (
        <SessionForm onSaved={() => navigate('/')} />
      ) : (
        <TestForm onSaved={() => navigate('/progress')} />
      )}
    </div>
  )
}
