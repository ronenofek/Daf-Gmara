"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { logError } from "../utils/error-utils"

interface Props {
  children: ReactNode
  language?: "en" | "he"
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, "ErrorBoundary", { errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      const isHebrew = this.props.language === "he"
      return (
        <Card className="mx-auto max-w-md mt-8">
          <CardContent className="pt-6">
            <div className={`text-center ${isHebrew ? "rtl" : "ltr"}`}>
              <p className="text-red-500 mb-4">
                {isHebrew ? "אירעה שגיאה בלתי צפויה. אנא נסה שוב." : "An unexpected error occurred. Please try again."}
              </p>
              {this.state.error && <p className="text-sm text-muted-foreground mb-4">{this.state.error.message}</p>}
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {isHebrew ? "נסה שוב" : "Try again"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

