import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiChatService } from './ai-chat.service';


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

  sendMessage() {
    if (this.message.trim()) {
      const userMsg = this.message;
      this.chatHistory.push({ from: 'user', text: userMsg });
      this.isLoading = true;
      this.aiChatService.sendMessage({ message: userMsg }).subscribe(response => {
        this.chatHistory.push({ from: 'ai', text: response.message });
        this.isLoading = false;
      }, () => {
        this.chatHistory.push({ from: 'ai', text: 'Sorry, I\'m having trouble connecting right now.' });
        this.isLoading = false;
      });
      this.message = '';
    }
  }
} 