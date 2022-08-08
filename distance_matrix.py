
###import packages 
import requests
import numpy as np
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import warnings 

warnings.filterwarnings('ignore')

'''
OSRM
'''

def compute_distance_osrm(point):
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    steps = "?steps=true"
    loc = "{},{};{},{}".format(point[1], point[0], point[3], point[2]) # lon, lat, lon, lat
    url = "http://127.0.0.1:5000/route/v1/driving/"
    r = session.get(url + loc + steps) 
    if r.status_code!= 200:
        return {}
  
    res = r.json()   
    return res['routes'][0]['distance']


'''
straight distance
'''
def compute_distance_straight(lat1, lon1, lat2, lon2):
    # haversine
    km_constant = 3959* 1.609344
    lat1, lon1, lat2, lon2 = map(np.deg2rad, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1 
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a)) 
    km = km_constant * c
    return km

# compute_distance_straight(OD['O_lat'], OD['O_lon'], OD['D_lat'], OD['D_lon'])




# import networkx as nx
# import osmnx as ox

# graph = ox.graph_from_place('제주도 대한민국', network_type='drive_service', simplify=False)

# # 강한 연결의 그래프만 반환
# graph = ox.utils_graph.get_largest_component(graph, strongly=True)


'''
OSMNX
'''
# # based on short path length
# def compute_distance_osmnx(point, graph=graph):
#     O_node = ox.get_nearest_node(graph, (point[0], point[1]))
#     D_node = ox.get_nearest_node(graph, (point[2], point[3]))
#     length = nx.dijkstra_path_length(G=graph, source=O_node, target=D_node, weight='length')
#     return length/1000