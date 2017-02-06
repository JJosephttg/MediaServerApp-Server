import base64
import json
import yaml
import os, sys

size = 128, 128


with open('./info/pyList.json') as file:
    data = yaml.load(open('./info/pyList.json'));



if data["path"]:
    print(data["path"]);
    image = open(data["path"], "rb");
    image.thumbnail(size)
    image_read = image.read();
    image_64_encode = base64.encodestring(image_read);
    print(image_64_encode);  
else:
    for i in range(0,len(data)):
        print(data[i]["path"])
        image = open(data[i]["path"], "rb"); #open binary file in read mode
        image.thumbnail(size)
        image_read = image.read();
        image_64_encode = base64.encodestring(image_read);
        print(image_64_encode);
        print('hey... fuck ya');


