import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChatService, ChatResponse } from './ai-chat.service';


@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  isOpen = false;
  message = '';
  chatHistory: { from: 'user' | 'ai', text: string }[] = [];
  isLoading = false;

  constructor(private aiChatService: AiChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  async sendMessage() {
    if (this.message.trim()) {
      const userMsg = this.message;
      this.chatHistory.push({ from: 'user', text: userMsg });
      this.isLoading = true;
      
      try {
        const chatObservable = await this.aiChatService.sendMessage({ message: userMsg });
        chatObservable.subscribe((response: ChatResponse) => {
          this.chatHistory.push({ from: 'ai', text: response.message });
          this.isLoading = false;
        });
      } catch (error) {
        this.chatHistory.push({ from: 'ai', text: 'Sorry, I\'m having trouble connecting right now.' });
        this.isLoading = false;
      }
      
      this.message = '';
    }
  }
}