// Quita el fondo de una foto y deja solo el sujeto (la copa), recortado a su contorno.
// Uso: swift tools/recortar-copa.swift entrada.jpg salida.png [xDesde xHasta] [--marco]
// xDesde/xHasta (en px del original) recortan antes, para quedarse con una sola copa.
// --marco conserva el tamaño original (fondo transparente) para calzar encima de la foto.
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let marco = CommandLine.arguments.contains("--marco")
let args = CommandLine.arguments.filter { $0 != "--marco" }
guard args.count >= 3,
      let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
      var img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
  fputs("uso: recortar-copa.swift entrada salida.png [xDesde xHasta]\n", stderr); exit(1)
}
if args.count >= 5, let a = Int(args[3]), let b = Int(args[4]) {
  img = img.cropping(to: CGRect(x: a, y: 0, width: b - a, height: img.height))!
}

let handler = VNImageRequestHandler(cgImage: img)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fputs("sin sujeto\n", stderr); exit(1) }
let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: !marco)

let ci = CIImage(cvPixelBuffer: buf)
let out = CIContext().createCGImage(ci, from: ci.extent)!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)
print("\(args[2]) \(out.width)x\(out.height)")
