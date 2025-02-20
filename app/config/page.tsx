"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ConfigPage() {
  const [apiKey, setApiKey] = useState("")
  const router = useRouter()

  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai_api_key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("openai_api_key", apiKey)
    router.push("/")
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Enter your OpenAI API key to use the Talmud Today application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full">
            Save and Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

