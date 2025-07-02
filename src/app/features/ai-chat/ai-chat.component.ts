import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { AiChatService, ChatRequest } from './ai-chat.service';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css',
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('typingAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AiChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;
  private destroy$ = new Subject<void>();

  // Quick response suggestions
  quickResponses = [
    'What courses do you recommend?',
    'How do I get started?',
    'Tell me about your platform',
    'How do I create an account?'
  ];

  constructor(private aiChatService: AiChatService) {}

  ngOnInit(): void {
    // Add welcome message
    this.addBotMessage('Hello! I\'m your AI learning assistant. I can help you explore courses, learn about our platform, and guide your learning journey. How can I help you today?');
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: this.newMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const userText = this.newMessage;
    this.newMessage = '';
    this.scrollToBottom();

    // Show typing indicator
    this.isTyping = true;

    // Send message to AI service
    const request: ChatRequest = {
      message: userText,
      context: 'e-learning platform assistance'
    };

    this.aiChatService.sendMessage(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isTyping = false;
          if (response.success) {
            this.addBotMessage(response.message);
          } else {
            this.addBotMessage('Sorry, I\'m having trouble connecting right now. Please try again later.');
          }
        },
        error: (error) => {
          console.error('AI Chat Error:', error);
          this.isTyping = false;
          this.addBotMessage('Sorry, I\'m having trouble connecting right now. Please try again later.');
        }
      });
  }

  sendQuickResponse(text: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Add a small delay to ensure event handling is complete
    setTimeout(() => {
      this.newMessage = text;
      this.sendMessage();
    }, 100);
  }

  private addBotMessage(text: string): void {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: false,
      timestamp: new Date()
    };

    this.messages.push(botMessage);
    this.scrollToBottom();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Handle scroll error
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  focusInput(): void {
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 100);
  }
} 