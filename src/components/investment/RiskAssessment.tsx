/**
 * RiskAssessment Component - Investment risk tolerance evaluation
 * Guides users through questions to determine their investment risk profile
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { RiskProfile, RiskQuestionResponse, BehavioralRiskFactors } from '@/types/financial'
import { RISK_ASSESSMENT_QUESTIONS, investmentMatchmaker } from '@/lib/investmentMatchmaker'

interface RiskAssessmentProps {
  onComplete: (riskProfile: RiskProfile) => void
  userId: string
  behavioralFactors: BehavioralRiskFactors
}

export function RiskAssessment({ onComplete, userId, behavioralFactors }: RiskAssessmentProps) {
  // Assessment state management
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<RiskQuestionResponse[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

  // Calculate progress percentage
  const progress = ((currentQuestion + 1) / RISK_ASSESSMENT_QUESTIONS.length) * 100

  // Handle user answer selection
  const handleAnswer = (answer: number) => {
    const question = RISK_ASSESSMENT_QUESTIONS[currentQuestion]
    const newResponse: RiskQuestionResponse = {
      question_id: question.id,
      question: question.question,
      answer,
      weight: question.weight
    }

    // Update responses and move to next question
    const updatedResponses = [...responses.filter(r => r.question_id !== question.id), newResponse]
    setResponses(updatedResponses)

    if (currentQuestion < RISK_ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Complete assessment and calculate risk profile
      const profile = investmentMatchmaker.calculateRiskProfile(updatedResponses, behavioralFactors)
      profile.user_id = userId
      setRiskProfile(profile)
      setIsComplete(true)
    }
  }

  // Complete assessment and return profile
  const handleComplete = () => {
    if (riskProfile) {
      onComplete(riskProfile)
    }
  }

  // Get appropriate icon for risk category
  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'conservative': return <Shield className="h-8 w-8 text-blue-500" />
      case 'moderate': return <TrendingUp className="h-8 w-8 text-yellow-500" />
      case 'aggressive': return <AlertTriangle className="h-8 w-8 text-red-500" />
      default: return <Shield className="h-8 w-8 text-gray-500" />
    }
  }

  // Get description for risk category
  const getRiskDescription = (category: string) => {
    switch (category) {
      case 'conservative':
        return 'You prefer stability and capital preservation. Your portfolio will focus on lower-risk investments with steady returns.'
      case 'moderate':
        return 'You seek a balance between growth and stability. Your portfolio will mix stocks and bonds for moderate risk and return.'
      case 'aggressive':
        return 'You\'re comfortable with volatility for higher potential returns. Your portfolio will emphasize growth investments.'
      default:
        return ''
    }
  }

  // Show completion screen with results
  if (isComplete && riskProfile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Risk Assessment Complete</CardTitle>
          <CardDescription>
            Your personalized investment profile is ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {getRiskIcon(riskProfile.category)}
              <div>
                <h3 className="text-xl font-semibold capitalize">{riskProfile.category} Investor</h3>
                <p className="text-sm text-muted-foreground">Risk Score: {riskProfile.overall_score}/100</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {getRiskDescription(riskProfile.category)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Confidence Score</h4>
              <p className="text-2xl font-bold text-blue-600">{riskProfile.confidence_score}%</p>
              <p className="text-xs text-blue-700">Assessment reliability</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Risk Tolerance</h4>
              <p className="text-2xl font-bold text-green-600">{riskProfile.overall_score}</p>
              <p className="text-xs text-green-700">Out of 100</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Your Assessment Summary:</h4>
            <div className="space-y-2 text-sm">
              {riskProfile.questionnaire_responses.map((response, index) => {
                const question = RISK_ASSESSMENT_QUESTIONS.find(q => q.id === response.question_id)
                const option = question?.options.find(opt => opt.value === response.answer)
                return (
                  <div key={response.question_id} className="flex justify-between p-2 bg-muted/30 rounded">
                    <span className="text-muted-foreground">Q{index + 1}:</span>
                    <span className="font-medium">{option?.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg">
            Get My Investment Recommendations
          </Button>
        </CardContent>
      </Card>
    )
  }

  const question = RISK_ASSESSMENT_QUESTIONS[currentQuestion]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg">Risk Assessment</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} of {RISK_ASSESSMENT_QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription>
          Help us understand your investment preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {question.question}
          </h3>
          
          <RadioGroup 
            value={responses.find(r => r.question_id === question.id)?.answer?.toString() || ''} 
            onValueChange={(value) => handleAnswer(parseInt(value))}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label 
                  htmlFor={`option-${option.value}`} 
                  className="flex-1 cursor-pointer leading-relaxed"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={() => {
              const selectedAnswer = responses.find(r => r.question_id === question.id)?.answer
              if (selectedAnswer !== undefined) {
                handleAnswer(selectedAnswer as number)
              }
            }}
            disabled={!responses.find(r => r.question_id === question.id)}
          >
            {currentQuestion === RISK_ASSESSMENT_QUESTIONS.length - 1 ? 'Complete Assessment' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 