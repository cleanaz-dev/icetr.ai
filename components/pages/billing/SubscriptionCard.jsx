"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, AlertCircle, CheckCircle, Clock, XCircle, Zap } from "lucide-react"



const getStatusIcon = (status) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "TRIALING":
      return <Zap className="h-4 w-4 text-blue-500" />
    case "PAST_DUE":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case "CANCELED":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "UNPAID":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "TRIALING":
      return "secondary"
    case "PAST_DUE":
    case "UNPAID":
      return "destructive"
    case "CANCELED":
      return "outline"
    default:
      return "secondary"
  }
}

export function SubscriptionCard({ subscription }) {
  const handleCancelSubscription = () => {
    // Handle subscription cancellation
    console.log("Canceling subscription:", subscription.id)
  }

  const handleReactivateSubscription = () => {
    // Handle subscription reactivation
    console.log("Reactivating subscription:", subscription.id)
  }

  const isTrialing = subscription.status === "TRIALING"
  const isCanceled = subscription.status === "CANCELED"
  const isActive = subscription.status === "ACTIVE"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Subscription</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(subscription.status)}
            <Badge variant={getStatusVariant(subscription.status)}>{subscription.status.replace("_", " ")}</Badge>
          </div>
        </CardTitle>
        <CardDescription>{subscription.metadata?.planName || "Subscription Plan"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{subscription.metadata?.planName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">
              ${((subscription.metadata?.planPrice || 0) / 100).toFixed(2)}/{subscription.metadata?.billingInterval}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium">{subscription.quantity} seats</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{isTrialing ? "Trial Ends" : "Next Billing"}</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {(isTrialing ? subscription.trialEnd : subscription.currentPeriodEnd)?.toLocaleDateString()}
            </span>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Subscription will cancel on {subscription.currentPeriodEnd.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isActive && !subscription.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You'll continue to have access until{" "}
                    {subscription.currentPeriodEnd.toLocaleDateString()}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription}>Cancel Subscription</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {subscription.cancelAtPeriodEnd && (
            <Button variant="outline" size="sm" onClick={handleReactivateSubscription}>
              Reactivate Subscription
            </Button>
          )}

          <Button variant="outline" size="sm">
            Change Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
