# TODO: Run pip freeze > requirements.txt from root
# TODO: list in readme to run pip install -r requirements.txt

import sys, json
from sklearn.utils.extmath import randomized_svd
import numpy as np
from threading import Timer
import pandas as pd

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    # return json.loads(lines[0])
    result = []
    for line in lines:
        result.append(json.loads(line))
    # return [json.loads(lines[0]), json.loads(lines[1])]
    return result

def main():
    # INPUT MATRIX
    lines = read_in()
    # THIS SHOULD BE BETWEEN 20 AND 100
    # components = lines[0]
    components = lines[0]
    matrix = lines[1]
    for line in lines[2:]:
        np.concatenate((matrix, line))
    # matrix = lines[1]
    # users = lines[2]
    # products = lines[3]

    R = np.array(matrix).astype(np.float)
    user_ratings_mean = np.mean(R, axis = 1)
    R_demeaned = R - user_ratings_mean.reshape(-1, 1)
    # Convert list to numpy array for svd operation
    # npa = np.asarray(matrix, dtype=np.float32)
    # U, Sigma, VT = randomized_svd(npa, n_components=components, n_iter=5, random_state=None)
    U, Sigma, VT = randomized_svd(R_demeaned, n_components=components, n_iter=5, random_state=None)
    # Convert sigma from flat array to dimensional array with diagonals filled in
    Sigma = np.diag(Sigma)
    all_user_predicted_ratings = np.dot(np.dot(U, Sigma), VT) + user_ratings_mean.reshape(-1, 1)
    all_user_predicted_ratings = np.round(all_user_predicted_ratings, 4)
    preds_df = pd.DataFrame(all_user_predicted_ratings)
    original = pd.DataFrame(matrix)

    # To generate sorted predictions for every user, iterate over users dictionary
    # To get user ID for DB insertion, and then users[user id] = column in dataframe

    sorted_user_predictions = preds_df.iloc[3].sort_values(ascending=False)

    # with open('data.txt', 'w') as outfile:
    #     json.dump(all_user_predicted_ratings.tolist(), outfile)

    print "PREDICTIONS"
    predicted = all_user_predicted_ratings.tolist()
    for user in predicted:
        print str(user)
    # print (str(all_user_predicted_ratings.tolist()))
    # print "DF"
    # print sorted_user_predictions
    print "DONE"
    # print "U"
    # # print(np.array2string(U, separator=', '))
    # print(str(U.tolist()))
    # print "SIGMA"
    # print(str(Sigma.tolist()))
    # print "VT"
    # # print(np.array2string(VT, separator=', '))
    # print(str(VT.tolist()))
    # print "DONE"

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
