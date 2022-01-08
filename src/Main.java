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

      // Create a 10ms carrier frequency buffer that loops perfectly
      int[] bufferCarrierInstance = Arrays.copyOfRange(bufferCarrier, bufferCarrier.length - (10 * samplesPerMs + 1835), bufferCarrier.length - 1835);
      // int[] bufferCarrierInstance = Arrays.copyOfRange(bufferCarrier, 0, 20000);

      String bitString = "";                        // The final Bit String
      int bits = (samplesPerMs * dataInMs) / 5000;  // Total Bits of Message regarding Sample Rate
      int totalBits = 0;                            // Current amount of Bits
      int bufferCounter = 0;                        // Current position inside the buffer
      double[] totalBlockDiff = new double[2];      // Left (0) and Right (1) side of a Bit compared

      do {
        totalBlockDiff[0] = 0;
        totalBlockDiff[1] = 0;
        totalBits++;

        // Loop through samples and compare Data Sample with Carrier Sample
        for (int s = (totalBits-1) * 5000; s < totalBits * 5000; s++) {
          int blockDiff = 0;    // Reset Difference

          // Calculate the absolute Difference of Data and Carrier Frequency Sample
          blockDiff = Math.max(bufferData[s], bufferCarrierInstance[bufferCounter % bufferCarrierInstance.length]) - Math.min(bufferData[s], bufferCarrierInstance[bufferCounter % bufferCarrierInstance.length]);

          // Add the absolute Difference to Left Side of the Bit if below first half
          if (s%5000 < (samplesPerBit / 2)) {
            totalBlockDiff[0] += (double) blockDiff * 0.00001;
          }
          // Add the absolute Difference to Right Side of the Bit if above first half
          else {
            totalBlockDiff[1] += (double) blockDiff * 0.00001;
          }

          bufferCounter++;      // Increase Position of Buffer after each read sample
        }

        // Print out information and append Bit to String
        System.out.print("  Bit " + totalBits + ":\t" + df.format(totalBlockDiff[0]) + "\t\t" + df.format(totalBlockDiff[1]));
        System.out.println("\t|\t" + (totalBlockDiff[0] > totalBlockDiff[1] ? 1 : 0));
        bitString += (totalBits%4) == 1 ? " ": "";
        bitString += totalBlockDiff[0] > totalBlockDiff[1] ? 1 : 0;
      }
      while (totalBits < bits);

      System.out.println(bitString);    // Print out complete Bit String
      wavFile.close();                  // Close the Wav File
    }
    catch (Exception e) {
      System.err.println(e);
    }
  }
}
