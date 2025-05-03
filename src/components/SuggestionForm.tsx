"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SuggestionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://formspree.io/f/meogavkv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
      <h3 className="text-lg font-bold text-purple-600 mb-4">Suggest a New Rule</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-purple-600">
            Your Email:
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="border-purple-600"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-purple-600">
            Your Suggestion:
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your rule idea here..."
            className="min-h-[100px] border-purple-600"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSubmitting ? 'Sending...' : 'Send Suggestion'}
        </Button>

        {submitStatus === 'success' && (
          <p className="text-green-600 text-sm">Thank you for your suggestion! We'll review it soon.</p>
        )}
        {submitStatus === 'error' && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again later.</p>
        )}
      </form>

      <p className="text-sm text-muted-foreground mt-4">
        Suggestions will be sent to sipan.hovsep@gmail.com
      </p>
    </div>
  );
};

export default SuggestionForm; 