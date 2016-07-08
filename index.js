import React, {PropTypes, Component} from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native'
import _ from 'lodash'
class EmailInput extends Component {
  constructor(props) {
    super(props);
    let {height, width} = Dimensions.get('window');

    this.state = {
      text: "",
      inputWidth: 200
    };

    this.wrapperWidth = width;
    this.parseEmails = this.parseEmails.bind(this);
    this.onChange = this.onChange.bind(this);
    this.pop = this.pop.bind(this);
    this.calculateWidth = this.calculateWidth.bind(this);
    this.focus = this.focus.bind(this);
  }
  measureWrapper() {
    if (!this.refs.wrapper)
      return;
    this.refs.wrapper.measure((ox, oy, w, h, px, py) => {
      this.wrapperWidth = w;
    });
  }
  calculateWidth() {

    setTimeout(() => {
      if (!this.refs['tag' + (this.props.value.length - 1)])
        return;
      this.refs['tag' + (this.props.value.length - 1)].measure((ox, oy, w, h, px, py) => {

        let endPosOfTag = w + ox;
        let margin = 3;
        let spaceLeft = this.wrapperWidth - endPosOfTag - margin;
        if (spaceLeft < 100) {
          this.setState({inputWidth: this.wrapperWidth});
        } else {
          this.setState({inputWidth: spaceLeft})
        }
      });
    }, 0);
  }
  componentDidMount() {
    setTimeout(() => {
      this.calculateWidth();
    }, 100);
  }
  componentWillReceiveProps() {
    this.calculateWidth();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value.length != this.props.value.length || !prevProps.value) {
      this.calculateWidth();
    }
  }
  onChange(event) {
    if (!event || !event.nativeEvent)
      return;
    let text = event.nativeEvent.text;
    this.setState({text: text});
    let lastTyped = text.charAt(text.length - 1);

    let parseWhen = [",", " ", ";"];

    if (parseWhen.indexOf(lastTyped) > -1)
      this.parseEmails();
    }

  parseEmails() {
    let {text} = this.state;
    let {value} = this.props;
    let regex = this.props.regex || /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    let results = text.match(regex);

    if (results && results.length > 0) {
      this.setState({text: ""});
      this.props.onChange(value.concat(results));
    }

  }
  onKeyPress(event) {
    if (this.state.text == "" && event.nativeEvent && event.nativeEvent.key == "Backspace") {
      this.pop();
    }
  }
  focus() {
    if (this.refs.emailInput)
      this.refs.emailInput.focus();
    }
  pop() {
    let emails = _.clone(this.props.value);
    emails.pop();
    this.props.onChange(emails);
    this.focus();
  }
  removeIndex(index) {
    let emails = _.clone(this.props.value);
    emails.splice(index, 1);
    this.props.onChange(emails);
    this.focus();

  }
  render() {
    let {text} = this.state;
    let {value} = this.props;

    let width = text.length < 4
      ? 100
      : null;

    let tagColor = this.props.tagColor || "#dddddd";
    let tagTextColor = this.props.tagTextColor || "#777777";
    let inputColor = this.props.inputColor || "#777777";

    return <TouchableWithoutFeedback onPress={() => this.refs.emailInput.focus()} onLayout={this.measureWrapper.bind(this)} style={{
      flex: 1
    }}>
      <View style={styles.wrapper} ref="wrapper" onLayout={this.measureWrapper.bind(this)}>
        {value.map((email, index) => {
          return <TouchableOpacity key={index} ref={"tag" + index} style={[
            styles.tag, {
              backgroundColor: tagColor
            }
          ]} onPress={this.removeIndex.bind(this, index)}>
            <Text style={[
              styles.tagText, {
                color: tagTextColor
              }
            ]}>{email}&nbsp;&times;</Text>
          </TouchableOpacity>
        })}

        <View style={{
          width: this.state.inputWidth
        }}>
          <TextInput ref="emailInput" blurOnSubmit={false} onKeyPress={this.onKeyPress.bind(this)} value={this.state.text} style={[
            styles.textInput, {
              width: width,
              color: inputColor
            }
          ]} autoCapitalize="none" autoCorrect={false} keyboardType={this.props.keyboardType || "email-address"} underlineColorAndroid="rgba(0,0,0,0)" onChange={this.onChange.bind(this)} onSubmitEditing={this.parseEmails}/>
        </View>
      </View>
    </TouchableWithoutFeedback>
  }
}

EmailInput.PropTypes = {
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.array.isRequired,
  regex: React.PropTypes.object,
  tagColor: React.PropTypes.string,
  tagTextColor: React.PropTypes.string,
  inputColor: React.PropTypes.string
}
export default EmailInput;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 3,
    marginBottom: 8
  },
  spacer: {
    flexWrap: 'wrap',
    height: 24,
    width: 0,
    backgroundColor: "red"
  },
  textInput: {
    height: 24,
    fontSize: 16,
    flex: .6,
    padding: 0,
    marginTop: 6,
    flexWrap: 'wrap'
  },
  tag: {
    padding: 0,
    justifyContent: 'center',
    marginTop: 5,
    marginRight: 3,
    flexWrap: 'wrap',
    padding: 8,
    height: 24,
    borderRadius: 2
  },
  tagText: {
    padding: 0,
    margin: 0
  }
})
