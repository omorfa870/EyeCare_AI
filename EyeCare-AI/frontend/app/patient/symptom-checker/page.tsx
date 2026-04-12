"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { symptomService } from "@/lib/api/symptom";
import { PredictionItem } from "@/lib/types";
import { Stethoscope, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const eyeSymptoms = [
  "red eye",
  "itching",
  "discharge",
  "crusting",
  "tearing",
  "light sensitivity",
  "burning",
  "stinging",
  "scratchy feeling",
  "gritty feeling",
  "watery eyes",
  "blurred vision",
  "eye fatigue",
  "cloudy vision",
  "faded colors",
  "glare",
  "halos around lights",
  "poor night vision",
  "severe eye pain",
  "headache",
  "nausea",
  "vomiting",
  "rainbow halos",
  "floaters",
  "floating spots",
  "trouble reading",
  "trouble seeing far away",
  "flashes of light",
  "gray curtain over vision",
  "shadow in vision",
  "sudden side vision loss",
  "sudden vision loss"
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function SymptomCheckerPage() {
  const [symptomText, setSymptomText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionItem[] | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [cleanedSymptom, setCleanedSymptom] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!symptomText.trim()) {
      setError("Please describe your symptoms");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const response = await symptomService.predict(symptomText);
      const allPredictions: PredictionItem[] = response.predictions || [];

      // Find the highest confidence score
      const maxConfidence = allPredictions.length > 0
        ? Math.max(...allPredictions.map(p => p.confidence))
        : 0;

      if (maxConfidence < 0.5) {
        // Below 50% — not related to eye disease
        setPredictions([]);
      } else {
        // Show only the single highest-confidence prediction
        const best = allPredictions.reduce((prev, curr) =>
          curr.confidence > prev.confidence ? curr : prev
        );
        setPredictions([best]);
      }

      setDisclaimer(response.disclaimer);
      setCleanedSymptom(response.cleaned_symptom);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to analyze symptoms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-emerald-500";
    if (confidence >= 0.4) return "text-amber-500";
    return "text-red-400";
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.7) return "bg-emerald-500";
    if (confidence >= 0.4) return "bg-amber-500";
    return "bg-red-400";
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -z-10" />

      <div className="container mx-auto px-6 py-10 z-10">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                AI Symptom Checker
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Describe your eye-related symptoms and our AI will help identify potential conditions. 
              This tool provides preliminary screening support only.
            </p>
          </div>

          {/* Input Card */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg mb-6">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-xl">Describe Your Symptoms</CardTitle>
              <CardDescription>
                Be as detailed as possible. Include when symptoms started, severity, and any related issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-3">Quick Select Common Symptoms:</p>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-primary/20">
                  {eyeSymptoms.map((symptom) => {
                    const isSelected = symptomText.toLowerCase().includes(symptom.toLowerCase());
                    return (
                      <button
                        key={symptom}
                        onClick={() => {
                          if (isSelected) {
                            setSymptomText(prev => prev.replace(new RegExp(`${symptom},?\\s*`, 'gi'), '').trim());
                          } else {
                            const newText = symptomText.trim();
                            setSymptomText(newText ? `${newText}, ${symptom}` : symptom);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                placeholder="Or describe your symptoms in your own words. Example: I've been experiencing blurry vision for the past week..."
                className="min-h-[150px] text-base resize-none border-border/50 focus:border-primary/50 bg-background/50"
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {symptomText.length} characters
                </p>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || !symptomText.trim()}
                  className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Symptoms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-500 font-medium">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Not-related message when predictions returned but all below 50% */}
          <AnimatePresence>
            {predictions !== null && predictions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center text-center gap-3">
                    <AlertCircle className="h-10 w-10 text-amber-500" />
                    <p className="text-lg font-bold text-foreground">Text is not related to eye disease</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Please describe eye-specific symptoms for a more accurate analysis.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {predictions && predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                {/* Processed Input */}
                {cleanedSymptom && (
                  <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Processed symptoms:</span>{" "}
                        {cleanedSymptom}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Predictions */}
                <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-lg">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Potential Conditions
                    </CardTitle>
                    <CardDescription>
                      Based on your symptoms, here is the most likely condition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {predictions.map((prediction, index) => (
                        <motion.div
                          key={prediction.disease}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full ${getConfidenceBg(prediction.confidence)} bg-opacity-20 flex items-center justify-center`}>
                              <span className="font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground capitalize">
                                {prediction.disease.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Match confidence
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                              {(prediction.confidence * 100).toFixed(1)}%
                            </p>
                            <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full ${getConfidenceBg(prediction.confidence)} transition-all duration-500`}
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                {disclaimer && (
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Important Disclaimer</p>
                          <p className="text-sm text-muted-foreground">{disclaimer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6 pb-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Concerned about these results? Book a consultation with an eye specialist.
                    </p>
                    <Button className="rounded-xl shadow-lg shadow-primary/20">
                      Book a Consultation
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
