<?php



	class LotteryChanceModel extends AppModel {
		protected $table = 'xxx_lottery_chance';	//todo 修改
		protected $want_dr = true;	//从dr(从数据库)中读取数据


		/**
		 * 获取抽奖次数
		 * @param string  $uin qq号码
		 * @param int $reason 抽奖的原因
		 */
		function get_num($uin, $reason, $params = array()){
			$default = array(
				'check_today' => true,
				'status' => 0
			);

			$params = array_merge($default, $params);
			$conditions = array(
				'uin' => $uin,
				'reason' => $reason,
				'status' => $params['status']
			);

			if( $params['check_today'] ){
				$t = date('Y-m-d 00:00:00');
				$conditions['created >='] = $t;
			}
			$res = $this->count($conditions);
			if($res){
				return $res;
			}else{
				return 0;
			}
		}


		/**
		 * 修改lottery chance的状态
		 * @param string  $uin qq号码
		 * @param int $reason 抽奖的原因
		 * @param string $present 获得奖品的字符串
		 * @param int $level 抽中等级
		 * @param array $params 其他参数
		 */
		function update_chance($uin, $reason, $present, $level, $params = array()){
			$default = array(
				'update_today' => true,		//只更新今天的抽奖记录
				'old_status' => 0,
				'new_status' => 1
			);
			$params = array_merge($default, $params);
			$conditions = array(
				'uin' => $uin,
				'reason' => $reason,
				'status' => $params['old_status']
			);

			if( $params['update_today'] ){
				$t = date('Y-m-d H:i:s', strtotime('today'));
				$conditions['created >='] = $t;
			}
			$chance = $this->findOne($conditions, array('order' => 'id desc'));
			if( !empty($chance) ) {
				$id = $chance[0]['id'];
				$conditions = array('uin'=>$uin, 'id'=>$id);
				$data = array('status'=>$params['new_status'], 'lottery_time'=>date('Y-m-d H:i:s'), 'present'=>$present,'present_level' => $level );
				return $this->update($data, $conditions);
			}
			return false;
		}

		/**
		 * 获取次数， 不判断status
		 * @param string  $uin qq号码
		 * @param int $reason 抽奖的原因
		 */
		function get_num_without_status($uin, $reason, $params = array()){
			$default = array(
				'check_today' => true,
			);

			$params = array_merge($default, $params);
			$conditions = array(
				'uin' => $uin,
				'reason' => $reason,
			);

			if( $params['check_today'] ){
				$t = date('Y-m-d 00:00:00');
				$conditions['created >='] = $t;
			}
			return $this->count($conditions);
		}

		/**
		 * 添加抽奖机会
		 */
		function add_lottery_chance($uin, $reason){
			$data = array(
				'uin' => $uin,
				'reason' => $reason,
				'created' =>  date('Y-m-d H:i:s')
			);
			return $this->add($data);
		}
	}
