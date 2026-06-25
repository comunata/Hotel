'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateRecommendation } from '@/lib/utils'
import type { ExperienceAnswer, ExperienceRecommendation } from '@/types'

const steps = [
  {
    id: 'group' as keyof ExperienceAnswer,
    question: 'Cine vine în escapadă?',
    options: ['Cuplu', 'Familie', 'Prieteni'],
  },
  {
    id: 'duration' as keyof ExperienceAnswer,
    question: 'Cât timp aveți la dispoziție?',
    options: ['Weekend (2–3 nopți)', 'Vacanță adevărată (5+ nopți)'],
  },
  {
    id: 'vibe' as keyof ExperienceAnswer,
    question: 'Ce căutați cu adevărat?',
    options: ['Liniște și relaxare totală', 'Aventură și explorare'],
  },
  {
    id: 'extras' as keyof ExperienceAnswer,
    question: 'Ce nu poate lipsi?',
    options: ['Ciubăr sub stele', 'Grătar cu prietenii', 'Ambele', 'Doar liniștea'],
  },
]

export default function ExperiencePlanner() {
  const [currentStep, setCurrentStep] = useState(-1) // -1 = intro
  const [answers, setAnswers] = useState<ExperienceAnswer>({})
  const [result, setResult] = useState<ExperienceRecommendation | null>(null)

  function handleStart() {
    setCurrentStep(0)
  }

  function handleAnswer(value: string) {
    const step = steps[currentStep]
    const newAnswers = { ...answers, [step.id]: value }
    setAnswers(newAnswers)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const rec = generateRecommendation(newAnswers)
      setResult(rec)
      setCurrentStep(steps.length)
    }
  }

  function handleReset() {
    setCurrentStep(-1)
    setAnswers({})
    setResult(null)
  }

  const progress = currentStep >= 0 ? ((currentStep) / steps.length) * 100 : 0

  return (
    <div className="max-w-lg">
      {/* Progress bar */}
      {currentStep >= 0 && currentStep < steps.length && (
        <div className="mb-8">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-sans mb-2">
            <span>Pasul {currentStep + 1} din {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-px bg-white/10 w-full">
            <div
              className="h-px bg-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Intro */}
      {currentStep === -1 && (
        <div className="animate-fade-up">
          <div className="border border-white/10 bg-white/5 p-8">
            <p className="font-serif text-2xl text-white font-light leading-snug">
              "Să găsim experiența<br />
              <em className="not-italic text-gold">perfectă pentru tine."</em>
            </p>
            <p className="mt-4 text-white/50 font-sans text-sm leading-relaxed">
              4 întrebări simple. O recomandare personalizată.
            </p>
            <button onClick={handleStart} className="mt-6 btn-gold">
              Începe
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Quiz step */}
      {currentStep >= 0 && currentStep < steps.length && (
        <div key={currentStep} className="animate-fade-up">
          <div className="border border-white/10 bg-white/5 p-8">
            <h3 className="font-serif text-2xl text-white font-light leading-snug">
              {steps[currentStep].question}
            </h3>
            <div className="mt-6 flex flex-col gap-3">
              {steps[currentStep].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left px-5 py-4 border border-white/10 text-white/80 text-sm font-sans
                             hover:border-gold hover:text-white hover:bg-gold/5
                             transition-all duration-200 group"
                >
                  <span className="flex items-center justify-between">
                    {option}
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#C89B5B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="mt-4 text-[11px] text-white/30 hover:text-white/60 font-sans transition-colors duration-200"
              >
                ← Înapoi
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-up">
          <div className="border border-gold/30 bg-gold/5 p-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium font-sans">
              Experiența ta recomandată
            </span>
            <h3 className="mt-3 font-serif text-3xl text-white font-light">
              {result.title}
            </h3>
            <p className="mt-4 text-white/70 font-sans text-sm leading-relaxed">
              {result.description}
            </p>
            <div className="mt-6 flex gap-4 flex-wrap">
              <span className="text-[11px] border border-white/10 px-3 py-1 text-white/60 font-sans">
                ◦ {result.duration}
              </span>
              <span className="text-[11px] border border-gold/30 px-3 py-1 text-gold font-sans">
                ◦ {result.highlight}
              </span>
              {result.extras.map((e) => (
                <span key={e} className="text-[11px] border border-white/10 px-3 py-1 text-white/60 font-sans">
                  ◦ {e}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/rezervare?exp=${encodeURIComponent(result.title)}&extras=${encodeURIComponent(result.extras.join(','))}`}
                className="btn-gold text-sm"
              >
                Rezervă această experiență →
              </Link>
              <button onClick={handleReset} className="text-sm text-white/40 hover:text-white/70 font-sans transition-colors duration-200">
                Reîncepe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
