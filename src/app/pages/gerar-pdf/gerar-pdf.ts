import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Button } from "primeng/button";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { Form, Quest } from '../listar-formularios/listar-formularios';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-gerar-pdf',
  imports: [Button, CommonModule, RadioButtonModule],
  templateUrl: './gerar-pdf.html',
  styleUrl: './gerar-pdf.css'
})
export class GerarPdf implements OnInit {
  @ViewChild('pdfSection', { static: false }) conteudo!: ElementRef;
  @Input() formulario!: Form;
  resposta: any;

  ngOnInit(): void {
    console.log(this.formulario);
  }

  public gerarPDF(): void{
    html2canvas(this.conteudo.nativeElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save('formulario.pdf');
    });
  }

  public buscarOpcoesParaEscala(min: number, max: number): string[]{
    const opcoes: string[] = [];
    for(let i = min; i <= max; i++){
      opcoes.push(i.toString());
    }
    return opcoes;
  }
}
