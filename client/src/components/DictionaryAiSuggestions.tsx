/**
 * Dictionary AI Suggestions Component
 * 
 * Displays AI-powered suggestions for dictionary items
 * Allows user to confirm or reject suggestions
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Suggestion {
  code: string;
  name: string;
  reason: string;
  confidence: number;
}

interface DictionaryAiSuggestionsProps {
  dictionaryCode: string;
  inputText: string;
  onConfirm?: (suggestion: Suggestion) => void;
  onReject?: (suggestion: Suggestion) => void;
  limit?: number;
}

export function DictionaryAiSuggestions({
  dictionaryCode,
  inputText,
  onConfirm,
  onReject,
  limit = 3,
}: DictionaryAiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());
  const [rejectedItems, setRejectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!inputText || inputText.length < 2) {
      setSuggestions([]);
      return;
    }

    loadSuggestions();
  }, [inputText, dictionaryCode]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual tRPC call
      // const data = await trpc.dictionaryAiAgent.getSuggestions.query({
      //   dictionaryCode,
      //   inputText,
      //   limit,
      // });
      // setSuggestions(data);

      // Mock suggestions for now
      const mockSuggestions: Record<string, Suggestion[]> = {
        product_categories: [
          {
            code: 'hot_drinks',
            name: 'Напитки горячие',
            reason: 'Matches keyword "горячий"',
            confidence: 0.95,
          },
          {
            code: 'cold_drinks',
            name: 'Напитки холодные',
            reason: 'Related to drinks',
            confidence: 0.7,
          },
        ],
        task_types: [
          {
            code: 'refill',
            name: 'Пополнение',
            reason: 'Common task type',
            confidence: 0.85,
          },
          {
            code: 'maintenance',
            name: 'Техническое обслуживание',
            reason: 'Related to maintenance',
            confidence: 0.75,
          },
        ],
      };

      setSuggestions(mockSuggestions[dictionaryCode] || []);
    } catch (error) {
      toast.error('Failed to load suggestions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = (suggestion: Suggestion) => {
    setConfirmedItems((prev) => new Set([...prev, suggestion.code]));
    setRejectedItems((prev) => {
      const next = new Set(prev);
      next.delete(suggestion.code);
      return next;
    });

    // TODO: Call confirmSuggestion API
    onConfirm?.(suggestion);
    toast.success(`Confirmed: ${suggestion.name}`);
  };

  const handleReject = (suggestion: Suggestion) => {
    setRejectedItems((prev) => new Set([...prev, suggestion.code]));
    setConfirmedItems((prev) => {
      const next = new Set(prev);
      next.delete(suggestion.code);
      return next;
    });

    // TODO: Call rejectSuggestion API
    onReject?.(suggestion);
    toast.info(`Rejected: ${suggestion.name}`);
  };

  if (!inputText || inputText.length < 2) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6 flex items-center gap-2 text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading AI suggestions...</span>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-500/10 border-blue-500/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <div>
            <CardTitle className="text-blue-400">AI Suggestions</CardTitle>
            <CardDescription className="text-slate-400">
              Based on your input: "{inputText}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => {
          const isConfirmed = confirmedItems.has(suggestion.code);
          const isRejected = rejectedItems.has(suggestion.code);

          return (
            <div
              key={suggestion.code}
              className={`p-3 rounded-lg border transition-all ${
                isConfirmed
                  ? 'bg-green-500/10 border-green-500/30'
                  : isRejected
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{suggestion.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        suggestion.confidence > 0.8
                          ? 'bg-green-500/20 text-green-400'
                          : suggestion.confidence > 0.6
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{suggestion.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">Code: {suggestion.code}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleConfirm(suggestion)}
                    disabled={isConfirmed}
                    className={`${
                      isConfirmed
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-slate-400 hover:text-green-400'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReject(suggestion)}
                    disabled={isRejected}
                    className={`${
                      isRejected
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-slate-400 hover:text-red-400'
                    }`}
                  >
                    {isRejected ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex items-start gap-2 pt-2 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Click the checkmark to confirm a suggestion or the X to reject it. Your feedback helps improve AI
            recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DictionaryAiSuggestions;
