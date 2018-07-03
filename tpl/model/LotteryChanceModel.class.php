<?php



	class LotteryChanceModel extends AppModel {
		protected $table = 'xxx_lottery_chance';	//todo �޸�
		protected $want_dr = true;	//��dr(�����ݿ�)�ж�ȡ����


		/**
		 * ��ȡ�齱����
		 * @param string  $uin qq����
		 * @param int $reason �齱��ԭ��
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
		 * �޸�lottery chance��״̬
		 * @param string  $uin qq����
		 * @param int $reason �齱��ԭ��
		 * @param string $present ��ý�Ʒ���ַ���
		 * @param int $level ���еȼ�
		 * @param array $params ��������
		 */
		function update_chance($uin, $reason, $present, $level, $params = array()){
			$default = array(
				'update_today' => true,		//ֻ���½���ĳ齱��¼
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
		 * ��ȡ������ ���ж�status
		 * @param string  $uin qq����
		 * @param int $reason �齱��ԭ��
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
		 * ��ӳ齱����
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
