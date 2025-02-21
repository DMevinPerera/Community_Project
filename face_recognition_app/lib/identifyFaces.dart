import 'dart:io';
import 'dart:typed_data';
import 'dart:convert';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img;

class TakePictureScreen extends StatefulWidget {
  const TakePictureScreen({super.key, required this.camera});

  final CameraDescription camera;

  @override
  TakePictureScreenState createState() => TakePictureScreenState();
}

class TakePictureScreenState extends State<TakePictureScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  String _result = '';
  int _rotationAngle = 270;
  // ignore: unused_field
  File? _latestImage;

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.medium,
    );

    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> uploadImage(File image) async {
    try {
      final request = http.MultipartRequest(
          'POST', Uri.parse('http://10.0.2.2:5000/check_faces'));
      request.files.add(await http.MultipartFile.fromPath('file', image.path));
      final response = await request.send();

      final responseBody = await response.stream.bytesToString();
      if (response.statusCode == 200) {
        setState(() {
          var jsonResponse = json.decode(responseBody);
          _result = jsonResponse['predicted_name'] ?? "Unknown";
        });
      } else if (response.statusCode == 600) {
        setState(() {
          _result = "I can't identify your face";
        });
      } else {
        setState(() {
          _result =
              'Failed to upload image. Error code: ${response.statusCode}\nServer response: $responseBody';
        });
      }
    } catch (e) {
      setState(() {
        _result = 'Error uploading image: $e';
      });
    }
  }

  Future<File> _rotateImage(String imagePath) async {
    try {
      final imageFile = File(imagePath);
      final imageBytes = await imageFile.readAsBytes();
      img.Image? image = img.decodeImage(Uint8List.fromList(imageBytes));

      if (image != null) {
        img.Image rotatedImage = img.copyRotate(image, angle: _rotationAngle);

        final rotatedImageFile = File(
            '${Directory.systemTemp.path}/rotated_image_${DateTime.now().millisecondsSinceEpoch}.jpg')
          ..writeAsBytesSync(img.encodeJpg(rotatedImage));

        return rotatedImageFile;
      } else {
        throw Exception("Failed to decode image.");
      }
    } catch (e) {
      print("Error rotating image: $e");
      rethrow;
    }
  }

  void _showImageDialog(File imageFile) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Captured Image'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.file(imageFile),
              SizedBox(height: 10),
              Text(
                'Predicted Name: $_result',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('OK'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Identify Face',
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.w900, fontSize: 25),
        ),
        backgroundColor: Color(0xFF293990),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(height: 20),
            Text(
              "Focus on the Face!",
              style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900),
            ),
            SizedBox(height: 15),
            FutureBuilder<void>(
              future: _initializeControllerFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done) {
                  return Stack(
                    children: [
                      CameraPreview(_controller),
                      Center(
                        child: CustomPaint(
                          size: MediaQuery.of(context).size,
                          painter: RectanglePainter(),
                        ),
                      ),
                      Positioned(
                        bottom: MediaQuery.of(context).size.height * 0.25,
                        left: MediaQuery.of(context).size.width * 0.3,
                        child: SizedBox(
                          width: 150.0,
                          height: 50.0,
                          child: FloatingActionButton(
                            onPressed: () async {
                              try {
                                await _initializeControllerFuture;
                                final image = await _controller.takePicture();
                                final rotatedImageFile =
                                    await _rotateImage(image.path);

                                setState(() {
                                  _latestImage = rotatedImageFile;
                                });

                                await uploadImage(rotatedImageFile);

                                if (!context.mounted) return;

                                _showImageDialog(rotatedImageFile);
                              } catch (e) {
                                print("Error: $e");
                              }
                            },
                            backgroundColor: Color(0xFF293990),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30.0),
                            ),
                            child: const Text(
                              "Detect",
                              style:
                                  TextStyle(color: Colors.white, fontSize: 20),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                } else {
                  return const Center(child: CircularProgressIndicator());
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class RectanglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.green
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final rectWidth = size.width * 0.6;
    final rectHeight = size.height * 0.3;
    final centerX = size.width / 2;
    final centerY = size.height / 3;

    final rect = Rect.fromCenter(
      center: Offset(centerX, centerY),
      width: rectWidth,
      height: rectHeight,
    );

    canvas.drawRect(rect, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
