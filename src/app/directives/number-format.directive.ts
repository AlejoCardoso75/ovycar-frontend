import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  standalone: true
})
export class NumberFormatDirective implements OnInit {
  @Input() appNumberFormat: 'currency' | 'number' = 'number';
  @Input() decimalPlaces: number = 0;
  @Input() thousandSeparator: string = ',';
  @Input() decimalSeparator: string = '.';

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private ngControl: NgControl
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    console.log('NumberFormatDirective initialized on:', this.el);
    // Formatear valor inicial si existe
    if (this.el.value) {
      console.log('Initial value:', this.el.value);
      this.formatValue();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    console.log('Input event triggered, value:', this.el.value);
    this.formatValue();
  }

  @HostListener('blur')
  onBlur() {
    console.log('Blur event triggered');
    this.formatValue();
  }

  @HostListener('focus')
  onFocus() {
    console.log('Focus event triggered');
    // Al hacer focus, mostrar solo números sin formato
    const value = this.el.value.replace(/[^\d]/g, '');
    this.el.value = value;
  }

  private formatValue(): void {
    console.log('Formatting value:', this.el.value);
    let value = this.el.value;
    
    // Remover todos los caracteres no numéricos
    value = value.replace(/[^\d]/g, '');
    console.log('Cleaned value:', value);
    
    // Convertir a número
    const numValue = parseInt(value) || 0;
    console.log('Numeric value:', numValue);
    
    // Formatear con separadores de miles
    const formatted = numValue.toLocaleString('en-US');
    console.log('Formatted value:', formatted);
    
    // Actualizar el input
    this.el.value = formatted;
    
    // Actualizar el control del formulario
    if (this.ngControl.control) {
      this.ngControl.control.setValue(numValue, { emitEvent: false });
    }
  }
}
