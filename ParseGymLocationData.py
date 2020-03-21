import xml.etree.ElementTree as ET
from collections import Counter

fieldList = ['Class', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']
inputPath = r'C:\Users\danie\Desktop\GEOG 575\GEOG-575-Lab-2\data'
files = ['AllClasses.txt', 'BodyAttack.txt', 'BodyCombat.txt', 'BodyPump.txt', 'BodyStep.txt', 'Sprint.txt']
outputPath = r'C:\Users\danie\Desktop\GEOG 575\GEOG-575-Lab-2\data'
outputFileName = 'classes.csv'

def get_state_from_address(text):
    input = text.split(",")
    cityStateZip = input[-2]
    state = cityStateZip.split(" ")[-2]
    return state


def get_count(path, filename): 

    file = open(r'{}\{}'.format(path, filename), 'r')
    data = file.read()
    file.close()

    root = ET.fromstring(data)

    states = []
    addressList = [] # To check for duplicate addresses

    for li in root:
        for item in li:
            if item.tag == "address" and item.text.endswith("United States"):
                address = item.text
                if address not in addressList:
                    addressList.append(address)
                    state = get_state_from_address(item.text)
                    states.append(str.upper(str(state)))

    c = Counter(states)

    countDict = dict(c)
    print(countDict)
    return countDict


def create_output_line(countDict, filename):
    className = filename.split('.')[0]
    output = className + ','
    countValues = []
    for state in fieldList[1:]:
        if state in countDict.keys():
            curValue = countDict[state]
            output += str(curValue) + ','
        else:
            output += '0,'
    output += '\n'
    return output

output = ''
for field in fieldList:
    output += field + ','
output = output[:-1] + '\n'

for file in files:
    countDict = get_count(inputPath, file)
    record = create_output_line(countDict, file)
    output += record
    

with open('{}\{}'.format(outputPath, outputFileName), 'w') as file:
          file.write(output)


