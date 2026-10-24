import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  heroHighlights = [
    { icon: 'bx-check-double', text: 'Préstamos, multas y salas en un solo lugar' },
    { icon: 'bx-devices', text: 'Gestión 100% digital' },
    { icon: 'bx-time', text: 'Acceso disponible 24/7' }
  ];

  features: FeatureItem[] = [
    {
      icon: 'bx-book-bookmark',
      title: 'Préstamos Digitales Instantáneos',
      description: 'Solicita libros en segundos con seguimiento en tiempo real de fechas límite y renovaciones.',
      tag: 'Préstamos'
    },
    {
      icon: 'bx-qr-scan',
      title: 'Acceso Ágil con Código QR',
      description: 'Retira y entrega ejemplares físicos escaneando el código único desde tu dispositivo móvil.',
      tag: 'Tecnología QR'
    },
    {
      icon: 'bx-door-open',
      title: 'Reserva de Salas de Estudio',
      description: 'Ambientes silenciosos y salas colaborativas preparadas para grupos o estudio individual.',
      tag: 'Espacios'
    },
    {
      icon: 'bx-star',
      title: 'Reseñas & Recomendaciones',
      description: 'Consulta valoraciones de otros lectores y califica tus lecturas favoritas de la biblioteca.',
      tag: 'Comunidad'
    },
    {
      icon: 'bx-bar-chart-alt-2',
      title: 'Métricas & Estadísticas',
      description: 'Panel integral para gestionar inventarios, usuarios, devoluciones e historial con total claridad.',
      tag: 'Gestión'
    },
    {
      icon: 'bx-shield-quarter',
      title: 'Seguridad y Privacidad',
      description: 'Autenticación protegida con control de roles según seas estudiante, docente o administrador.',
      tag: 'Seguridad'
    }
  ];

  faqs: FaqItem[] = [
    {
      question: '¿Cómo puedo ingresar al sistema de CiberBook?',
      answer: 'Haz clic en el botón "Iniciar Sesión" en la barra superior o en el inicio. Introduce tu correo y contraseña para entrar a tu panel.',
      isOpen: true
    },
    {
      question: '¿Cómo solicito un libro en préstamo?',
      answer: 'Una vez que inicies sesión con tu cuenta de usuario, navega por el catálogo digital, selecciona el libro de tu interés y presiona "Solicitar Préstamo". Podrás ver la fecha límite y el estado de tu pedido.',
      isOpen: false
    },
    {
      question: '¿Puedo reservar salas de estudio?',
      answer: 'Sí. Disponemos de salas individuales y de trabajo grupal. En tu panel de cliente encontrarás la sección de Salas donde podrás elegir fecha y horario según disponibilidad.',
      isOpen: false
    },
    {
      question: '¿Qué hago si no tengo una cuenta registrada?',
      answer: 'Puedes hacer clic en el botón "Registrarse" para crear tu cuenta en menos de un minuto y empezar a solicitar libros.',
      isOpen: false
    }
  ];

  constructor(public themeService: ThemeService) {}

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
