import pandas as pd
import requests
import json
from tqdm import tqdm

def cut_address(address):
    url = 'https://dapi.kakao.com/v2/local/search/address.json?query=' + address
    headers = {"Authorization": "KakaoAK 7dcc77a63de65b3cf73a27725b8fe8b2"}
    api_json = json.loads(str(requests.get(url,headers=headers).text))
    if len(api_json['documents']) == 0:
        address = address.rsplit(' ', 1)[0]
        api_json = cut_address(address)
    return api_json

def get_location_dataframe(data):
    crd = []
    address_lst = data['전체주소']
    for address in tqdm(address_lst):
        api_json = cut_address(address)
        address = api_json['documents'][0]['address']
        crd_ = [str(address['y']), str(address['x'])]
        crd.append(crd_)
    crd_df = pd.DataFrame(crd, columns=['위도', '경도'])
    df = pd.concat([data, crd_df], axis=1)
    return df

def get_location(address):
    url = 'https://dapi.kakao.com/v2/local/search/address.json?query=' + address
    headers = {"Authorization": "KakaoAK 7dcc77a63de65b3cf73a27725b8fe8b2"}
    api_json = json.loads(str(requests.get(url,headers=headers).text))
    address = api_json['documents'][0]['address']
    crd_ = [str(address['y']), str(address['x'])]
    return crd_