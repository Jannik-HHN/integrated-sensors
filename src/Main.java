import java.io.*;
import java.text.DecimalFormat;
import java.util.Arrays;
import wavfile.WavFile;

public class Main {

  public static void main(String[] args) {
    System.out.println("Demodulator for PSK Encoded Signals");
    DecimalFormat df = new DecimalFormat("0.000");
    int samplesPerBit = 5000;
    int samplesPerMs = (int) (5000 / 2.5);
    int carrierInMs = 160;
    int dataInMs = 360;

    try {

      System.out.println("-----------------------------");
      // Open the wav file specified as the first argument
      WavFile wavFile = WavFile.openWavFile(new File("res/HackRF-110054-Mono.wav"));

      // Display information about the wav file
      wavFile.display();

      System.out.println("-----------------------------");

      // Get the number of audio channels in the wav file
      int numChannels = wavFile.getNumChannels();

      // Create the buffer for 160ms Carrier and 360ms Data
      int[] bufferCarrier = new int[samplesPerMs * carrierInMs * numChannels];
      int[] bufferData = new int[samplesPerMs * dataInMs * numChannels];

      // Write the values into each buffer
      int framesRead;
      framesRead = wavFile.readFrames(bufferCarrier, samplesPerMs * carrierInMs);
      framesRead = wavFile.readFrames(bufferData, samplesPerMs * dataInMs);

      // Create a 10ms carrier instance that loops perfectly
      int[] bufferCarrierInstance = Arrays.copyOfRange(bufferCarrier, bufferCarrier.length - (10 * samplesPerMs + 60000), bufferCarrier.length - 60000);
      // int[] bufferCarrierInstance = Arrays.copyOfRange(bufferCarrier, 0, 20000);

      int bufferCounter = 0;
      double[] totalBlockDiff = new double[2];
      String bitString = "";
      int bits = (samplesPerMs * dataInMs) / 5000;
      int totalBits = 0;
      do {
        totalBlockDiff[0] = 0;
        totalBlockDiff[1] = 0;
        totalBits++;

        // Loop through frames and look for minimum and maximum value
        for (int s = (totalBits-1) * 5000; s < totalBits * 5000; s++) {
          int blockDiff = 0;
          blockDiff = Math.max(bufferData[s], bufferCarrierInstance[bufferCounter % bufferCarrierInstance.length]) - Math.min(bufferData[s], bufferCarrierInstance[bufferCounter % bufferCarrierInstance.length]);
          //System.out.println((blockDiff));
          //blockDiff = Math.abs(bufferData[s]) - Math.abs(bufferCarrierInstance[bufferCounter % bufferCarrierInstance.length]);
          if (s%5000 < (samplesPerBit / 2)) {
            totalBlockDiff[0] += (double) blockDiff * 0.00001;
            // if (blockDiff < 1500) totalBlockDiff[0]++;
          } else {
            totalBlockDiff[1] += (double) blockDiff * 0.00001;
            // if (blockDiff < 1500) totalBlockDiff[1]++;
          }
          bufferCounter++;
        }
        System.out.print("  Bit " + totalBits + ":\t" + df.format(totalBlockDiff[0]) + "\t\t" + df.format(totalBlockDiff[1]));
        System.out.println("\t|\t" + (totalBlockDiff[0] > totalBlockDiff[1] ? 1 : 0));
        bitString += (totalBits%4) == 1 ? " ": "";
        bitString += totalBlockDiff[0] > totalBlockDiff[1] ? 1 : 0;
      }
      while (totalBits < bits);

      System.out.println(bitString);

      // Close the wavFile
      wavFile.close();

    } catch (Exception e) {
      System.err.println(e);
    }
  }
}
