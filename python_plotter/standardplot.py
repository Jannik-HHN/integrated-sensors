import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 20, 100)  # Create a list of evenly-spaced numbers over the range

counter = 0
data = []

with open('../elt-data.txt') as f:
    lines = f.readlines()
    for line in lines:
        if counter%10000 == 0:
            data.append(line)
        counter += 1

plt.plot(data)       # Plot the sine of each x point
plt.show()                   # Display the plot