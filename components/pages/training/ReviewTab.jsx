import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderSearch, 
  AudioLines, 
  ClipboardList, 
  Clock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Star
} from "lucide-react";
import React, { useState } from "react";
import TranscriptChat from "./TranscriptChat";
import ReviewDataCard from "./ReviewCardData";

const getGradeColor = (grade) => {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-300";
    case "B":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "C":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "D":
    case "F":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const OverviewStats = ({ trainingData }) => {
  const totalSessions = trainingData.length;
  const avgIntroScore = trainingData.reduce((sum, review) => sum + (review.introQualityScore || 0), 0) / totalSessions;
  const recentGrade = trainingData[0]?.overallScore;
  const improvementTrend = trainingData.length > 1 ? 
    (trainingData[0]?.introQualityScore || 0) - (trainingData[1]?.introQualityScore || 0) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{avgIntroScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Avg Overall Score</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${getGradeColor(recentGrade)}`}>
            {recentGrade || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Latest Grade</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold">{Math.abs(improvementTrend).toFixed(1)}</span>
            {improvementTrend > 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : improvementTrend < 0 ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Minus className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">Recent Trend</div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReviewCard = ({ review, index, totalReviews, trainingUser }) => {
  const [isExpanded, setIsExpanded] = useState(null); // First review expanded by default

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {review.type === "CALLS" ? (
              <AudioLines className="w-5 h-5 text-primary transition-transform duration-200 hover:scale-110" />
            ) : (
              <ClipboardList className="w-5 h-5 text-primary transition-transform duration-200 hover:scale-110" />
            )}
            <div>
              <CardTitle className="text-lg transition-colors duration-200">
                Session #{totalReviews - index} - {review.type === "CALLS" ? "Call Training" : "General Review"}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
               
               <Badge><span className="capitalize">Type: {review.scenario}</span></Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {review.overallScore && (
              <Badge className={`${getGradeColor(review.overallScore)} transition-all duration-200 hover:scale-105`}>
                Grade {review.overallScore}
              </Badge>
            )}
            <div className={`transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </CardHeader>

      <div className={`transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'opacity-100' 
          : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <CardContent className="pt-0 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Training Review Details */}
            <div className="transform transition-all duration-300 ease-in-out">
              <ReviewDataCard review={review} />
            </div>

            {/* Right: Transcript */}
            {review.transcript && (
              <div className="md:border-l pl-6 max-h-[600px] overflow-y-auto transform transition-all duration-300 ease-in-out delay-100">
                <div className="mb-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Session Transcript
                  </h4>
                </div>
                <div className="animate-in fade-in-50 duration-500 delay-200">
                  <TranscriptChat transcriptData={review.transcript} trainingUser={trainingUser} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default function ReviewTab({ trainingData = [], trainingUser }) {
  // Sort reviews by date (newest first)
  const sortedData = [...trainingData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <TabsContent value="review" className="space-y-0">
      <div className="min-h-[calc(100vh-100px)]">
        <Card className="transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle className="text-2xl">Training Reviews</CardTitle>
            <CardDescription>
              Analyze your performance and improve your skills
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!trainingData || trainingData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in-100 duration-500">
                <FolderSearch className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
                <h3 className="text-lg font-medium mb-2">
                  No training reviews yet
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Complete your first training session to see your performance
                  analysis here.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in-50 duration-700">
                {/* Overview Stats */}
                <div className="animate-in slide-in-from-top-4 duration-500">
                  <OverviewStats trainingData={sortedData} />
                </div>

                {/* Individual Reviews */}
                <div className="space-y-0">
                  {sortedData.map((review, index) => (
                    <div 
                      key={index}
                      className="animate-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ReviewCard 
                        review={review} 
                        index={index}
                        totalReviews={sortedData.length}
                        trainingUser={trainingUser}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}