# TODO: Run pip freeze > requirements.txt from root
# TODO: list in readme to run pip install -r requirements.txt

import sys, json
from sklearn.utils.extmath import randomized_svd
import numpy as np
from threading import Timer

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    # INPUT MATRIX
    lines = read_in()
    components = lines[0]
    matrix = lines[1]
    # Convert list to numpy array for svd operation
    npa = np.asarray(matrix, dtype=np.float32)
    U, Sigma, VT = randomized_svd(npa, n_components=components, n_iter=5, random_state=None)
    # Convert sigma from flat array to dimensional array with diagonals filled in
    Sigma = np.diag(Sigma)
    print "U"
    # print(np.array2string(U, separator=', '))
    print(str(U.tolist()))
    print "SIGMA"
    print(str(Sigma.tolist()))
    print "VT"
    # print(np.array2string(VT, separator=', '))
    print(str(VT.tolist()))
    print "DONE"

    #get our data as an array from read_in()
    # lines = read_in()
    #
    # # Sum  of all the items in the providen array
    # total_sum_inArray = 0
    # for item in lines:
    #     for num in item:
    #         total_sum_inArray += num
    #
    # #return the sum to the output stream
    # # print total_sum_inArray
    # print lines[0]

# Start process
if __name__ == '__main__':
    main()
