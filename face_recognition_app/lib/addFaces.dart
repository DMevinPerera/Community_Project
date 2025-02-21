import 'dart:io';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as img;

class RegisterFaceScreen extends StatefulWidget {
  const RegisterFaceScreen({super.key, required this.camera});

  final CameraDescription camera;

  @override
  State<RegisterFaceScreen> createState() => _RegisterFaceScreenState();
}

class _RegisterFaceScreenState extends State<RegisterFaceScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  final TextEditingController _nameController = TextEditingController();
  bool _isRegistering = false;
  bool _isProcessing = false;
  int _imagesCaptured = 0;
  String _result = '';
  List<String> _imagePaths = [];
  int _rotationAngle = 270;

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
    _nameController.dispose();
    super.dispose();
  }

  void _showResultDialog(String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            message.startsWith('Success') ? 'Success' : 'Error',
            style: TextStyle(
              color: message.startsWith('Success') ? Colors.green : Colors.red,
            ),
          ),
          content: Text(message),
          actions: <Widget>[
            TextButton(
              child: const Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
                // Clear the name field and result
                _nameController.clear();
                setState(() {
                  _result = '';
                });
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _captureAndSendImages(String name) async {
    try {
      setState(() {
        _isRegistering = true;
        _imagesCaptured = 0;
        _imagePaths = [];
      });

      // Capture images
      for (int i = 0; i < 100; i++) {
        final image = await _controller.takePicture();
        final rotatedImageFile = await _rotateImage(image.path);
        _imagePaths.add(rotatedImageFile.path);

        setState(() {
          _imagesCaptured = i + 1;
        });
      }

      // Show processing state
      setState(() {
        _isProcessing = true;
      });

      // Send to backend
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('http://10.0.2.2:5000/register_face'),
      );
      request.fields['name'] = name;
      for (final path in _imagePaths) {
        request.files.add(await http.MultipartFile.fromPath('images', path));
      }

      final response = await request.send();
      // ignore: unused_local_variable
      final responseBody = await response.stream.bytesToString();

      setState(() {
        if (response.statusCode == 200) {
          _result = "Success: Face registered successfully";
        } else {
          _result = "Error: Failed to register face";
        }
      });

      // Show result dialog
      _showResultDialog(_result);
    } catch (e) {
      setState(() {
        _result = "Error: $e";
      });
      _showResultDialog(_result);
    } finally {
      setState(() {
        _isRegistering = false;
        _isProcessing = false;
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

        final rotatedImageFile =
            File('${Directory.systemTemp.path}/rotated_image.jpg')
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Register Face',
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.w900, fontSize: 25),
        ),
        backgroundColor: Color(0xFF293990),
      ),
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              children: [
                SizedBox(height: 20),
                Text(
                  "Focus on the Face!",
                  style: TextStyle(fontSize: 25, fontWeight: FontWeight.w900),
                ),
                SizedBox(height: 10),
                FutureBuilder<void>(
                  future: _initializeControllerFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.done) {
                      return Column(
                        children: [
                          SizedBox(
                            height: MediaQuery.of(context).size.height * 0.6,
                            child: Stack(
                              children: [
                                CameraPreview(_controller),
                                Center(
                                  child: CustomPaint(
                                    size: MediaQuery.of(context).size,
                                    painter: RectanglePainter(),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                if (_isRegistering && !_isProcessing)
                                  Text("Images Captured: $_imagesCaptured/100",
                                      style: const TextStyle(fontSize: 18)),
                                if (!_isRegistering)
                                  Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: TextField(
                                      controller: _nameController,
                                      decoration: const InputDecoration(
                                        labelText: 'Enter your name',
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  ),
                                ElevatedButton(
                                  style: ButtonStyle(
                                    backgroundColor: MaterialStateProperty.all(
                                        Color(0xFF293990)),
                                  ),
                                  onPressed: (_isRegistering || _isProcessing)
                                      ? null
                                      : () async {
                                          final name =
                                              _nameController.text.trim();
                                          if (name.isEmpty) {
                                            _showResultDialog(
                                                "Error: Name cannot be empty!");
                                            return;
                                          }

                                          await _initializeControllerFuture;
                                          _captureAndSendImages(name);
                                        },
                                  child: const Text(
                                    'Register Face',
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 20),
                                  ),
                                ),
                              ],
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
          // Overlay loading indicator when processing
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    CircularProgressIndicator(
                      color: Color(0xFF293990),
                    ),
                    SizedBox(height: 20),
                    Text(
                      'Processing Images...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
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

    final rectWidth = size.width * 0.7;
    final rectHeight = size.height * 0.5;
    final centerX = size.width / 2;
    final centerY = size.height / 2;

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
