const React = require('react-native');
const Colors = require('../commonComponents/Colors');
const Icon = require('react-native-vector-icons/Ionicons');
const CommonComponents = require('../commonComponents/CommonComponents');
const DXRNUtils = require('../commonComponents/DXRNUtils');

const {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableHighlight,
} = React;

const ICON_SIZE = 20;

const GHCell = React.createClass({
  propTypes: {
    ghEvent: React.PropTypes.object,
  },

  openTargetRepo() {
    let targetRepo = this.props.repo;
    targetRepo.html = 'https://github.com/' + targetRepo.full_name + '/blob/master/README.md';
    targetRepo.title = targetRepo.full_name;

    this.props.navigator.push({id: 'web', obj: targetRepo});
  },

  render() {
    const repo = this.props.repo;
    const repoIcon = repo.fork ? 'fork-repo' : 'ios-bookmarks';

    return (
      <TouchableHighlight
        onPress={this.openTargetRepo}
        underlayColor={'lightGray'}>
        <View style={styles.cellContentView}>
          <View style={styles.cellLeft}>
            <View style={styles.cellLeftRepo}>
              <Icon
                size={ICON_SIZE}
                name={repoIcon}
                style={styles.cellLeftRepoIcon}
                color='gray'/>
              <Text style={styles.cellLeftRepoName}>{repo.name}</Text>
            </View>
            <Text style={styles.cellLeftRepoDesc}>{repo.description}</Text>
          </View>
          <View style={styles.cellRight}>
            <Text style={styles.cellRightText}>{repo.stargazers_count}</Text>
            <Icon
              size={ICON_SIZE}
              name='android-star'
              style={styles.cellLeftRepoIcon}
              color='gray'/>
          </View>
          <Text style={styles.language}>
            {repo.language}
          </Text>
        </View>
      </TouchableHighlight>
    )
  },
});

const styles = StyleSheet.create({
  cellContentView: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    borderColor: Colors.borderColor,
    borderBottomWidth: 0.5,
  },
  cellLeft: {
    flexDirection: 'column',
    width: 250,
  },
  cellLeftRepo: {
    flexDirection: 'row',
  },
  cellLeftRepoIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  cellLeftRepoName: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  cellLeftRepoDesc: {
    color: 'gray',
    fontSize: 13,
    marginLeft: 20,
    marginTop: 5,
  },
  cellRight: {
    flexDirection: 'row',
    marginTop: 10,
  },
  cellRightText: {
    color: Colors.textGray,
    fontWeight: '500',
    marginTop: 2,
  },
  cellUp: {
    margin: 10,
    height: 40,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 1,
  },

  avatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.backGray
  },

  username: {
    marginLeft: 10,
    height: 19,
    color: '#4078C0',
    fontSize: 15,
  },

  textActionContainer: {
    margin: 10,
    marginTop: 7,
    marginBottom: 10,
    marginLeft: 10,
  },

  textDesContainer: {
    margin: 10,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 25,
    borderStyle: 'dashed',
  },

  linkText: {
    color: '#4078C0',
    fontSize: 15,
    fontWeight: 'normal',
  },

  actionText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },

  normalText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: 'normal',
  },

  commentText: {
    color: Colors.textGray,
  },

  createAt: {
    marginLeft: 10,
    marginTop: 2,
    height: 14,
    fontSize: 11,
    color: '#BFBFBF',
  },

  language: {
    position: 'absolute',
    top: 3,
    right: 3,
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

module.exports = GHCell
