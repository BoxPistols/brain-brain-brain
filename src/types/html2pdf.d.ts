declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    html2canvas?: Record<string, unknown>
    jsPDF?: Record<string, unknown>
    pagebreak?: Record<string, unknown>
  }
  interface Html2PdfInstance {
    set(opt: Record<string, unknown>): Html2PdfInstance
    from(el: HTMLElement | string): Html2PdfInstance
    save(): Promise<void>
  }
  function html2pdf(): Html2PdfInstance
  export default html2pdf
}
