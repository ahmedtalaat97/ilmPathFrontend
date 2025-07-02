import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ChatRequest {
  message: string;
  context?: string;
  userId?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Send a message to the AI service
   * This method can be easily modified to work with different AI providers
   */
  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    const modelUrl = `${environment.apiUrl}/AiChat`;
    const body = {
      model: 'baidu/ernie-4.5-21B-a3b', // or your desired model
      inputs: request.message
    };
    return this.http.post<any>(modelUrl, body).pipe(
      map(response => ({
        message: response.generatedText || 'No response from AI.',
        timestamp: new Date(),
        success: true
      })),
      catchError(error => of({
        message: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
        success: false,
        error: error.message
      }))
    );
  }

  /**
   * Mock AI response for development
   * Replace this with actual AI service calls
   */
  private mockAIResponse(userMessage: string): Observable<ChatResponse> {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('course') || lowerMessage.includes('recommend')) {
      response = 'I\'d be happy to help you find the perfect course! We have courses in programming, design, business, and more. What interests you most?';
    } else if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      response = 'Great! To get started, browse our course catalog and choose a course that interests you. You can start with our beginner-friendly courses.';
    } else if (lowerMessage.includes('platform') || lowerMessage.includes('about')) {
      response = 'IlmPath is an e-learning platform designed to help you master new skills. We offer high-quality courses with practical projects and expert instructors.';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('choose')) {
      response = 'I can help you choose a course based on your interests and skill level. What field are you interested in learning?';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = 'Our courses are competitively priced and offer great value. You can view individual course prices on their detail pages. We also offer bundle discounts!';
    } else if (lowerMessage.includes('instructor') || lowerMessage.includes('teacher')) {
      response = 'Our instructors are industry experts with years of experience. They create engaging content and are available to help you succeed in your learning journey.';
    } else if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('account')) {
      response = 'To create an account, click the "Sign Up" button in the top right corner. It\'s free and only takes a minute!';
    } else if (lowerMessage.includes('login') || lowerMessage.includes('sign in')) {
      response = 'You can log in using the "Log In" button in the top right corner. If you don\'t have an account yet, you can sign up for free!';
    } else {
      response = 'That\'s an interesting question! I\'m here to help you with your learning journey. Could you tell me more about what you\'d like to learn?';
    }

    // Simulate network delay
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          message: response,
          timestamp: new Date(),
          success: true
        });
        observer.complete();
      }, 1000 + Math.random() * 2000);
    });
  }

  /**
   * Integration with Hugging Face Inference API (FREE)
   * Using Microsoft's DialoGPT model for conversational AI
   */
  private sendToHuggingFace(request: ChatRequest): Observable<ChatResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.huggingFaceApiKey}`
    });

    // Use Microsoft's DialoGPT model for conversational responses
    const modelUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
    
    const body = {
      inputs: `You are a helpful AI assistant for an e-learning platform called IlmPath. Help users find courses, understand the platform, and guide their learning journey. Be friendly, informative, and encouraging. Keep responses concise but helpful. You can help with course recommendations, platform information, account creation, and general learning guidance.

User: ${request.message}
Assistant:`,
      parameters: {
        max_length: 150,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9
      }
    };

    // Use environment variable for API key, fallback to mock if not available
    const apiKey = environment.huggingFaceApiKey;
    
    if (!apiKey || apiKey === 'hf_...') {
      console.warn('Hugging Face API key not configured. Using mock response.');
      return this.mockAIResponse(request.message);
    }

    return this.http.post<any>(modelUrl, body, { headers })
      .pipe(
        map(response => {
          if (response && response[0] && response[0].generated_text) {
            // Extract the assistant's response from the generated text
            const fullText = response[0].generated_text;
            const assistantResponse = fullText.split('Assistant:')[1] || fullText;
            
            return {
              message: assistantResponse.trim(),
              timestamp: new Date(),
              success: true
            };
          } else {
            throw new Error('Invalid response format from Hugging Face');
          }
        }),
        catchError(error => {
          console.error('Hugging Face API Error:', error);
          return of({
            message: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
            timestamp: new Date(),
            success: false,
            error: error.message
          });
        })
      );
  }
} 