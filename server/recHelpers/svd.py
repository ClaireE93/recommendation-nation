import sys, json
from sklearn.utils.extmath import randomized_svd
import numpy as np
import pandas as pd
from pymongo import MongoClient
from elasticsearch import Elasticsearch
from scipy.sparse.linalg import svds

client = MongoClient()
db = client.recs
es = Elasticsearch()

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    result = []
    for line in lines:
        result.append(json.loads(line))
    return result

def getUserRecs(user_ID, original, preds_df):
    # Original user rating input data
    user_data = original.loc[user_ID]
    sorted_user_predictions = preds_df.loc[user_ID].sort_values(ascending=False)

    # Remove items user has not rated
    user_data_clean = user_data[user_data != '0']

    # Remove any negative recommendations
    sorted_user_predictions = sorted_user_predictions[sorted_user_predictions > 0]
    recommendations = {}
    count = 0
    tot = 0;

    # Get top 15 recommendations that user has not already purchased
    for index, row in sorted_user_predictions.iteritems():
        db_object = {}

        if index not in user_data_clean.index:
            recommendations[str(index)] = row
            count += 1
            tot += 1
            if (tot == 15):
                break

    db_object = {
        'recommendations': recommendations,
        'count': count,
        'user': user_ID
    }

    # Update Mongo (recommendations) and elasticsearch (count) databases
    db.recs.update({'user': user_ID}, {'$set': db_object}, upsert=True)
    es.update(index='recs', doc_type='recommendation', id=user_ID, body={'doc':{'number': count, 'user': user_ID}, 'doc_as_upsert':True})

def main():
    lines = read_in()
    print "IN MAIN"

    # Construct arguments from stdin
    components = lines[0]
    users = lines[1]
    products = lines[2]
    products = [str(i) for i in products]
    matrix = lines[3]
    for line in lines[4:]:
        matrix = np.concatenate((matrix, line))

    # Convert list to numpy array for svd operation
    R = np.array(matrix).astype(np.float)

    # Handle user rating bias
    user_ratings_mean = np.mean(R, axis = 1)
    R_demeaned = R - user_ratings_mean.reshape(-1, 1)
    # U, Sigma, VT = randomized_svd(R_demeaned, n_components=components, n_iter=5, random_state=None)
    U, Sigma, VT = svds(R_demeaned, k=components)
    print "U SIGMA VT CREATED"

    # Convert sigma from flat array to dimensional array with diagonals filled in
    Sigma = np.diag(Sigma)

    # Get table of all predictions
    all_user_predicted_ratings = np.dot(np.dot(U, Sigma), VT) + user_ratings_mean.reshape(-1, 1)
    all_user_predicted_ratings = np.round(all_user_predicted_ratings, 4)

    # Construct Data Frames for predictions and original ratings
    preds_df = pd.DataFrame(all_user_predicted_ratings, index=users, columns=products)
    original = pd.DataFrame(matrix, index=users, columns=products)

    # Iterate over all users and construct recommendations
    print "ENTERING LOOP"
    for row in preds_df.itertuples():
        getUserRecs(row[0], original, preds_df)

# Start process
if __name__ == '__main__':
    main()
