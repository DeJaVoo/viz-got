import json
import math
import pandas as pd

def get_nested_rec(key, grp):
    """
    get nested record
    :param key:
    :param grp:
    :return:
    """

    root = {'name': key}

    deadFemales = []
    deadMales = []
    aliveFemales = []
    aliveMales = []
    for k, x in grp.groupby(['Name']):
        if not math.isnan(x['DeathBook']):
            # male
            if x['Gender'].values[0] == 1:
                deadMales.append(k)
            # female
            else:
                deadFemales.append(k)
        else:
            # male
            if x['Gender'].values[0] == 1:
                aliveMales.append(k)
            # female
            else:
                aliveFemales.append(k)

    tempRecord = []
    for x in deadMales:
        temp = {'name': x}
        tempRecord.append(temp)
    deadMalesRecords = {'name': "Male", 'children': tempRecord}

    tempRecord = []
    for x in deadFemales:
        temp = {'name': x}
        tempRecord.append(temp)
    deadFemalesRecords = {'name': "Female", 'children': tempRecord}

    tempRecord = []
    for x in aliveMales:
        temp = {'name': x}
        tempRecord.append(temp)
    aliveMalesRecords = {'name': "Male", 'children': tempRecord}

    tempRecord = []
    for x in aliveFemales:
        temp = {'name': x}
        tempRecord.append(temp)
    aliveFemalesRecords = {'name': "Female", 'children': tempRecord}

    deadRecords = {'name': "Dead", 'children': [deadMalesRecords, deadFemalesRecords]}
    aliveRecords = {'name': "Alive", 'children': [aliveMalesRecords, aliveFemalesRecords]}
    record = [deadRecords, aliveRecords]
    root['children'] = record
    return root


def main():
    df = pd.read_csv('db.csv')
    records = []
    for key, group in df.groupby(['Allegiances']):
        if not key == 'None':
            rec = get_nested_rec(key, group)
            records.append(rec)

    records = dict(data=records)

    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
