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
    result = []
    for line in lines:
        result.append(json.loads(line))
    return result

def main():
    # INPUT MATRIX
    lines = read_in()
    # THIS SHOULD BE BETWEEN 20 AND 100
    components = lines[0]
    user = lines[1]
    products = lines[2]
    matrix = lines[3]
    for line in lines[4:]:
        matrix = np.concatenate((matrix, line))
    # Convert list to numpy array for svd operation
    R = np.array(matrix).astype(np.float)
    # Handle user rating bias
    user_ratings_mean = np.mean(R, axis = 1)
    R_demeaned = R - user_ratings_mean.reshape(-1, 1)
    U, Sigma, VT = randomized_svd(R_demeaned, n_components=components, n_iter=5, random_state=None)
    # Convert sigma from flat array to dimensional array with diagonals filled in
    Sigma = np.diag(Sigma)
    # Get table of all predictions
    all_user_predicted_ratings = np.dot(np.dot(U, Sigma), VT) + user_ratings_mean.reshape(-1, 1)
    all_user_predicted_ratings = np.round(all_user_predicted_ratings, 4)
    # Construct Data Frame
    preds_df = pd.DataFrame(all_user_predicted_ratings, columns=products)
    original = pd.DataFrame(matrix, columns=products)
    # TODO: Get this to work!
    def getUserRecs(user_ind, user_ID):
        # Original user rating input data
        user_data = original.iloc[user_ind]
        sorted_user_predictions = preds_df.iloc[user_ind].sort_values(ascending=False)
        print "USER DATA"
        print user_data
        user_data_clean = user_data[user_data != 0]
        print "CLEANED"
        print user_data_clean
        print "DF_PREDICTIONS"
        # Remove any negative recommendations
        sorted_user_predictions = sorted_user_predictions[sorted_user_predictions > 0]
        print sorted_user_predictions

        # TODO: create recommendations by iterating over sorted preds data
        # Check if prediction is in user_data_clean, if not, add to recommendation dictionary

        recommendations = {}
        print "LOOPING"
        for index, row in sorted_user_predictions.iteritems():
            print index # product id
            print row # rating
            if index not in user_data_clean.index and row > 0:
                recommendations[index] = row



        # recommendations = (movies_df[~movies_df['MovieID'].isin(user_full['MovieID'])].
        #  merge(pd.DataFrame(sorted_user_predictions).reset_index(), how = 'left',
        #        left_on = 'MovieID',
        #        right_on = 'MovieID').
        #  rename(columns = {user_row_number: 'Predictions'}).
        #  sort_values('Predictions', ascending = False).
        #                iloc[:num_recommendations, :-1]
        #               )


    getUserRecs(3)

    # To generate sorted predictions for every user, iterate over users dictionary
    # To get user ID for DB insertion, and then users[user id] = column in dataframe




    print "PREDICTIONS"
    predicted = all_user_predicted_ratings.tolist()
    for user in predicted:
        print str(user)
    # print (str(all_user_predicted_ratings.tolist()))
    # print "DF"
    # print sorted_user_predictions
    print "DONE"


# Start process
if __name__ == '__main__':
    main()
