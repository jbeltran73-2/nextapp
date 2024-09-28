'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const platforms = [
  { name: "OpenAI", models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview"] },
  { name: "Groq", models: ["llama2-70b-4096", "mixtral-8x7b-32768"] },
  { name: "Google Gemini", models: ["gemini-pro", "gemini-ultra"] },
  { name: "Qwen", models: ["qwen-turbo", "qwen-plus", "qwen-max"] }
]

interface ApiResponse {
  text: string;
  error?: string;
}

export default function Component() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(Array(4).fill(''))
  const [selectedModels, setSelectedModels] = useState(Array(4).fill(''))
  const [apiKeys, setApiKeys] = useState(Array(4).fill(''))
  const [chatMessage, setChatMessage] = useState('')
  const [results, setResults] = useState<ApiResponse[]>(Array(4).fill({ text: '' }))
  const [isLoading, setIsLoading] = useState(false)

  const handlePlatformSelect = (index: number, value: string) => {
    const newPlatforms = [...selectedPlatforms]
    newPlatforms[index] = value
    setSelectedPlatforms(newPlatforms)
    
    // Reset the model for this index when platform changes
    const newModels = [...selectedModels]
    newModels[index] = ''
    setSelectedModels(newModels)
  }

  const handleModelSelect = (index: number, value: string) => {
    const newModels = [...selectedModels]
    newModels[index] = value
    setSelectedModels(newModels)
  }

  const handleApiKeyChange = (index: number, value: string) => {
    const newApiKeys = [...apiKeys]
    newApiKeys[index] = value
    setApiKeys(newApiKeys)
  }

  const callApi = async (platform: string, model: string, apiKey: string, message: string): Promise<ApiResponse> => {
    // This is a placeholder for actual API calls
    // In a real application, you would make actual API calls to each platform here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    if (Math.random() > 0.9) { // Simulate occasional errors
      throw new Error(`Error calling ${platform} API`)
    }
    
    return { text: `Response from ${platform} using ${model}: "${message}"` }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResults(Array(4).fill({ text: '' }))

    const apiCalls = selectedPlatforms.map((platform, index) => 
      platform && selectedModels[index] && apiKeys[index]
        ? callApi(platform, selectedModels[index], apiKeys[index], chatMessage)
        : Promise.resolve({ text: '' })
    )

    try {
      const results = await Promise.all(apiCalls)
      setResults(results)
    } catch (error) {
      console.error('Error calling APIs:', error)
      setResults(prev => prev.map((result, i) => 
        apiCalls[i] ? { text: '', error: 'Error calling API' } : result
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comparador Avanzado de Modelos LLM</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[0, 1, 2, 3].map(index => (
          <div key={index} className="space-y-2">
            <Select onValueChange={(value) => handlePlatformSelect(index, value)}>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccionar Plataforma ${index + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform.name} value={platform.name}>{platform.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlatforms[index] && (
              <Select onValueChange={(value) => handleModelSelect(index, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccionar Modelo para ${selectedPlatforms[index]}`} />
                </SelectTrigger>
                <SelectContent>
                  {platforms.find(p => p.name === selectedPlatforms[index])?.models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              type="password"
              placeholder={`Clave API para ${selectedPlatforms[index] || 'Plataforma ' + (index + 1)}`}
              value={apiKeys[index]}
              onChange={(e) => handleApiKeyChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="chat-message">Mensaje del Chat</Label>
          <Textarea
            id="chat-message"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Introduce tu mensaje aquí..."
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comparando...
            </>
          ) : (
            'Comparar Respuestas'
          )}
        </Button>
      </form>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{selectedPlatforms[index] || `Plataforma ${index + 1}`}</CardTitle>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              ) : (
                <p>{result.text || 'No hay resultado aún'}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="available-models">
          <AccordionTrigger>Modelos Disponibles por Plataforma</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map(platform => (
                <Card key={platform.name}>
                  <CardHeader>
                    <CardTitle>{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      {platform.models.map(model => (
                        <li key={model}>{model}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}